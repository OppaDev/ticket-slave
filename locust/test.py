import random
from locust import HttpUser, task, between, SequentialTaskSet

# ------------------------------------------------------------------------------
# --- DATOS Y CONFIGURACIÓN DE PRUEBA ---
# ------------------------------------------------------------------------------
# Asegúrate de que estos usuarios existen en tu BBDD después de ejecutar los seeders.
CUSTOMER_CREDENTIALS = {"email": "customer@test.com", "password": "password"}
ORGANIZER_CREDENTIALS = {"email": "organizer@test.com", "password": "password"}

# El host es la URL de tu API Gateway Kong. Ajusta si es diferente.
API_HOST = "http://localhost:8000"

class BaseApiUser(HttpUser):
    """
    Clase base para usuarios que necesitan autenticarse.
    Maneja el login y almacena el token.
    """
    host = API_HOST
    abstract = True  # Para que Locust no intente instanciar esta clase directamente.

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.token = None
        self.headers = {}

    def login(self, credentials, user_type="User"):
        """Realiza el login y guarda el token en self.token."""
        with self.client.post("/api/v1/auth/login", json=credentials, name=f"/api/v1/auth/login ({user_type})") as response:
            if response.status_code == 200:
                self.token = response.json().get("token")
                self.headers = {"Authorization": f"Bearer {self.token}"}
            else:
                response.failure(f"Failed to login for {user_type} with email {credentials['email']}")
                self.token = None # Asegurarse de que no hay token si falla
        return self.token

# ==============================================================================
# --- TAREAS SECUENCIALES (User Journeys) ---
# ==============================================================================

class CustomerPurchaseFlow(SequentialTaskSet):
    """
    Simula el flujo de compra completo de un cliente, paso a paso.
    """
    def on_start(self):
        """Se ejecuta al inicio de esta secuencia de tareas."""
        self.event_id = None
        self.ticket_type_id = None

    @task
    def view_random_event(self):
        with self.client.get("/api/v1/events?limit=20", name="/api/v1/events (get random)") as response:
            if response.status_code == 200 and response.json():
                events = response.json()
                if events:
                    self.event_id = random.choice(events)['id']
                else:
                    self.interrupt() # No hay eventos, detener el flujo
            else:
                response.failure("Could not fetch events to start purchase flow")
                self.interrupt()

    @task
    def view_event_ticket_types(self):
        if not self.event_id:
            self.interrupt()
        with self.client.get(f"/api/v1/events/{self.event_id}/ticket-types", name="/api/v1/events/[id]/ticket-types") as response:
            if response.status_code == 200 and response.json():
                available_types = response.json()
                if available_types:
                    self.ticket_type_id = random.choice(available_types)['id']
                else:
                    self.interrupt() # No hay tipos de ticket para este evento
            else:
                response.failure(f"Could not get ticket types for event {self.event_id}")
                self.interrupt()

    @task
    def add_to_cart(self):
        if not self.ticket_type_id:
            self.interrupt()
        cart_payload = {
            "ticketTypeId": str(self.ticket_type_id),
            "cantidad": random.randint(1, 2)
        }
        self.client.post("/api/v1/cart/items", json=cart_payload, headers=self.user.headers, name="/api/v1/cart/items (add)")

    @task
    def create_order(self):
        order_payload = {
            "paymentMethodId": "pm_card_visa", # Simulación de un método de pago de Stripe
            "billingAddress": {
                "nombreCompleto": "Usuario de Prueba Locust", "identificacion": "9999999999",
                "direccion": "Calle Falsa 123", "ciudad": "Locustown", "pais": "EC"
            }
        }
        self.client.post("/api/v1/orders", json=order_payload, headers=self.user.headers, name="/api/v1/orders (create)")
        # Al finalizar, el flujo se detiene y el usuario virtual hará otra tarea.
        self.interrupt()

class OrganizerEventFlow(SequentialTaskSet):
    """
    Simula el flujo de un organizador creando un nuevo evento y publicándolo.
    """
    def on_start(self):
        self.venue_id = None
        self.category_id = None
        self.event_id = None

    @task
    def create_venue(self):
        venue_payload = {
            "nombre": f"Venue Creado por Locust {random.randint(1000, 9999)}",
            "direccion": "Av. de la Simulación 123", "ciudad": "Quito", "pais": "EC"
        }
        with self.client.post("/api/v1/venues", json=venue_payload, headers=self.user.headers, name="/api/v1/venues (create)") as response:
            if response.status_code == 201:
                self.venue_id = response.json().get('id')
            else:
                self.interrupt()

    @task
    def get_category(self):
        with self.client.get("/api/v1/categories", name="/api/v1/categories (get for organizer)") as response:
            if response.status_code == 200 and response.json():
                self.category_id = random.choice(response.json())['id']
            else:
                self.interrupt()

    @task
    def create_event(self):
        if not self.venue_id or not self.category_id:
            self.interrupt()
        event_payload = {
            "nombre": f"Evento de Prueba Locust {random.randint(1000, 9999)}",
            "descripcion": "Este es un evento de prueba generado automáticamente por Locust para pruebas de carga.",
            "fechaInicio": "2025-12-01T20:00:00Z", "fechaFin": "2025-12-01T23:00:00Z",
            "categoryId": str(self.category_id), "venueId": str(self.venue_id)
        }
        with self.client.post("/api/v1/events", json=event_payload, headers=self.user.headers, name="/api/v1/events (create)") as response:
            if response.status_code == 201:
                self.event_id = response.json().get('id')
            else:
                self.interrupt()

    @task
    def publish_event(self):
        if not self.event_id:
            self.interrupt()
        self.client.post(f"/api/v1/events/{self.event_id}/publish", headers=self.user.headers, name="/api/v1/events/[id]/publish")
        self.interrupt()

# ==============================================================================
# --- DEFINICIÓN DE PERSONAS (Usuarios Virtuales) ---
# ==============================================================================

class AnonymousUser(HttpUser):
    """
    Usuario anónimo que principalmente navega por el sitio.
    """
    host = API_HOST
    wait_time = between(1, 4)
    weight = 10 # La mayoría del tráfico es de usuarios anónimos

    @task(10)
    def browse_events(self):
        self.client.get("/api/v1/events", name="/api/v1/events (browse all)")

    @task(5)
    def view_event_detail(self):
        with self.client.get("/api/v1/events?limit=50", name="/api/v1/events (get one for detail)") as response:
            if response.status_code == 200 and response.json():
                events = response.json()
                if events:
                    event_id = random.choice(events)['id']
                    self.client.get(f"/api/v1/events/{event_id}", name="/api/v1/events/[id] (detail view)")

    @task(3)
    def browse_categories(self):
        self.client.get("/api/v1/categories", name="/api/v1/categories (browse)")

    @task(2)
    def browse_venues(self):
        self.client.get("/api/v1/venues", name="/api/v1/venues (browse)")

class CustomerUser(BaseApiUser):
    """
    Usuario registrado que inicia sesión, navega y compra tickets.
    """
    wait_time = between(2, 5)
    weight = 5 # Menos clientes que navegantes, pero son tráfico importante

    def on_start(self):
        self.login(CUSTOMER_CREDENTIALS, "Customer")

    @task(10)
    def browse(self):
        # Un cliente logueado también navega
        self.client.get("/api/v1/events", name="/api/v1/events (customer browse)", headers=self.headers)

    @task(3)
    def purchase_flow(self):
        if self.token: # Solo intentar si el login fue exitoso
            self.run_task(CustomerPurchaseFlow)

    @task(5)
    def view_my_orders_and_tickets(self):
        if not self.token:
            return
        # Ver historial de órdenes
        with self.client.get("/api/v1/orders", name="/api/v1/orders (view history)", headers=self.headers) as response:
            if response.status_code == 200 and response.json():
                orders = response.json().get('data', [])
                if orders:
                    # Ver el detalle de una orden
                    order_id = random.choice(orders)['id']
                    self.client.get(f"/api/v1/orders/{order_id}", name="/api/v1/orders/[id] (detail)", headers=self.headers)
        # Ver mis tickets
        self.client.get("/api/v1/tickets", name="/api/v1/tickets (view my tickets)", headers=self.headers)

class OrganizerUser(BaseApiUser):
    """
    Usuario organizador que crea y gestiona eventos.
    """
    wait_time = between(5, 15) # Los organizadores realizan acciones más lentas y pesadas
    weight = 1 # El tráfico de organizadores es el menos frecuente

    def on_start(self):
        self.login(ORGANIZER_CREDENTIALS, "Organizer")

    @task
    def create_and_manage_events(self):
        if self.token:
            self.run_task(OrganizerEventFlow)