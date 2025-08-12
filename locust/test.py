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
    def view_current_cart(self):
        """Ver el carrito actual antes de agregar items."""
        self.client.get("/api/v1/cart", headers=self.user.headers, name="/api/v1/cart (view current)")

    @task
    def add_to_cart(self):
        if not self.ticket_type_id:
            self.interrupt()
        cart_payload = {
            "ticketTypeId": str(self.ticket_type_id),
            "cantidad": random.randint(1, 2)
        }
        with self.client.post("/api/v1/cart/items", json=cart_payload, headers=self.user.headers, name="/api/v1/cart/items (add)") as response:
            if response.status_code != 200:
                response.failure(f"Failed to add item to cart: {response.status_code}")
                self.interrupt()

    @task
    def review_cart_after_adding(self):
        """Revisar el carrito después de agregar items."""
        self.client.get("/api/v1/cart", headers=self.user.headers, name="/api/v1/cart (review after adding)")

    @task
    def create_order(self):
        order_payload = {
            "paymentMethodId": "pm_card_visa", # Simulación de un método de pago de Stripe
            "billingAddress": {
                "nombreCompleto": "Usuario de Prueba Locust", 
                "identificacion": "9999999999",
                "direccion": "Calle Falsa 123", 
                "ciudad": "Locustown", 
                "pais": "EC"
            }
        }
        with self.client.post("/api/v1/orders", json=order_payload, headers=self.user.headers, name="/api/v1/orders (create)") as response:
            if response.status_code == 201:
                # Orden creada exitosamente
                pass
            else:
                response.failure(f"Failed to create order: {response.status_code}")
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

class CartAndOrderTestFlow(SequentialTaskSet):
    """
    Flujo específico para probar intensivamente el carrito y las órdenes.
    """
    def on_start(self):
        self.event_id = None
        self.ticket_type_ids = []
        self.order_id = None

    @task
    def clear_cart_initially(self):
        """Limpiar el carrito al inicio."""
        self.client.delete("/api/v1/cart", headers=self.user.headers, name="/api/v1/cart (clear initially)")

    @task
    def get_available_events_and_tickets(self):
        """Obtener eventos y tipos de tickets disponibles."""
        with self.client.get("/api/v1/events?limit=15", name="/api/v1/events (for cart test)", headers=self.user.headers) as response:
            if response.status_code == 200 and response.json():
                events = response.json()
                if events:
                    self.event_id = random.choice(events)['id']
                    
                    # Obtener tipos de ticket
                    with self.client.get(f"/api/v1/events/{self.event_id}/ticket-types", name="/api/v1/events/[id]/ticket-types (for cart test)", headers=self.user.headers) as ticket_response:
                        if ticket_response.status_code == 200 and ticket_response.json():
                            ticket_types = ticket_response.json()
                            self.ticket_type_ids = [ticket['id'] for ticket in ticket_types]
                        else:
                            self.interrupt()
                else:
                    self.interrupt()
            else:
                self.interrupt()

    @task
    def add_multiple_items_to_cart(self):
        """Agregar múltiples items al carrito."""
        if not self.ticket_type_ids:
            self.interrupt()
        
        # Agregar 2-4 items diferentes al carrito
        items_to_add = min(random.randint(2, 4), len(self.ticket_type_ids))
        selected_tickets = random.sample(self.ticket_type_ids, items_to_add)
        
        for ticket_type_id in selected_tickets:
            cart_payload = {
                "ticketTypeId": str(ticket_type_id),
                "cantidad": random.randint(1, 3)
            }
            self.client.post("/api/v1/cart/items", 
                           json=cart_payload, 
                           headers=self.user.headers, 
                           name="/api/v1/cart/items (add multiple)")

    @task
    def review_cart_contents(self):
        """Revisar el contenido del carrito."""
        with self.client.get("/api/v1/cart", headers=self.user.headers, name="/api/v1/cart (review contents)") as response:
            if response.status_code == 200:
                cart_data = response.json()
                cart_items = cart_data.get('items', [])
                
                # Si hay más de 2 items, remover uno aleatoriamente
                if len(cart_items) > 2:
                    item_to_remove = random.choice(cart_items)
                    item_id = item_to_remove.get('itemId')
                    if item_id:
                        self.client.delete(f"/api/v1/cart/items/{item_id}", 
                                         headers=self.user.headers, 
                                         name="/api/v1/cart/items/[id] (remove from review)")

    @task
    def create_order_from_cart(self):
        """Crear orden desde el carrito."""
        order_payload = {
            "paymentMethodId": f"pm_card_{random.choice(['visa', 'mastercard', 'amex'])}", 
            "billingAddress": {
                "nombreCompleto": f"Usuario Test {random.randint(1000, 9999)}", 
                "identificacion": f"{random.randint(1000000000, 9999999999)}",
                "direccion": f"Calle {random.randint(1, 999)} #{random.randint(1, 99)}", 
                "ciudad": random.choice(["Quito", "Guayaquil", "Cuenca", "Manta"]), 
                "pais": "EC"
            }
        }
        with self.client.post("/api/v1/orders", json=order_payload, headers=self.user.headers, name="/api/v1/orders (create from cart)") as response:
            if response.status_code == 201:
                order_data = response.json()
                self.order_id = order_data.get('id')
            else:
                response.failure(f"Failed to create order: {response.status_code}")

    @task
    def review_created_order(self):
        """Revisar la orden creada."""
        if self.order_id:
            self.client.get(f"/api/v1/orders/{self.order_id}", headers=self.user.headers, name="/api/v1/orders/[id] (review created)")

    @task
    def view_tickets_after_order(self):
        """Ver tickets después de crear la orden."""
        self.client.get("/api/v1/tickets", headers=self.user.headers, name="/api/v1/tickets (after order)")
        
        # Finalizar el flujo
        self.interrupt()

    @task
    def test_cart_edge_cases(self):
        """Probar casos límite del carrito."""
        # Intentar agregar item con cantidad inválida
        invalid_payload = {
            "ticketTypeId": "invalid-id",
            "cantidad": 0
        }
        self.client.post("/api/v1/cart/items", 
                       json=invalid_payload, 
                       headers=self.user.headers, 
                       name="/api/v1/cart/items (invalid quantity)")
        
        # Intentar remover item inexistente
        self.client.delete("/api/v1/cart/items/999999", 
                         headers=self.user.headers, 
                         name="/api/v1/cart/items/[id] (non-existent)")
        
        # Crear orden con carrito vacío
        order_payload = {
            "paymentMethodId": "pm_card_visa",
            "billingAddress": {
                "nombreCompleto": "Test Empty Cart",
                "identificacion": "1234567890",
                "direccion": "Test Address",
                "ciudad": "Test City",
                "pais": "EC"
            }
        }
        self.client.post("/api/v1/orders", 
                       json=order_payload, 
                       headers=self.user.headers, 
                       name="/api/v1/orders (empty cart test)")

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
            # Simular el flujo de compra paso a paso
            self._purchase_flow_step_by_step()

    def _purchase_flow_step_by_step(self):
        """Ejecutar el flujo de compra paso a paso."""
        # 1. Obtener evento aleatorio
        with self.client.get("/api/v1/events?limit=20", name="/api/v1/events (purchase flow)") as response:
            if response.status_code == 200 and response.json():
                events = response.json()
                if not events:
                    return
                event_id = random.choice(events)['id']
            else:
                return
        
        # 2. Obtener tipos de ticket para el evento
        with self.client.get(f"/api/v1/events/{event_id}/ticket-types", name="/api/v1/events/[id]/ticket-types (purchase flow)") as response:
            if response.status_code == 200 and response.json():
                ticket_types = response.json()
                if not ticket_types:
                    return
                ticket_type_id = random.choice(ticket_types)['id']
            else:
                return
        
        # 3. Ver carrito actual
        self.client.get("/api/v1/cart", headers=self.headers, name="/api/v1/cart (purchase flow view)")
        
        # 4. Agregar item al carrito
        cart_payload = {
            "ticketTypeId": str(ticket_type_id),
            "cantidad": random.randint(1, 2)
        }
        with self.client.post("/api/v1/cart/items", json=cart_payload, headers=self.headers, name="/api/v1/cart/items (purchase flow add)") as response:
            if response.status_code != 200:
                return
        
        # 5. Revisar carrito después de agregar
        self.client.get("/api/v1/cart", headers=self.headers, name="/api/v1/cart (purchase flow review)")
        
        # 6. Crear orden
        order_payload = {
            "paymentMethodId": "pm_card_visa",
            "billingAddress": {
                "nombreCompleto": "Usuario de Prueba Locust",
                "identificacion": "9999999999",
                "direccion": "Calle Falsa 123",
                "ciudad": "Locustown",
                "pais": "EC"
            }
        }
        self.client.post("/api/v1/orders", json=order_payload, headers=self.headers, name="/api/v1/orders (purchase flow create)")

    @task(2)
    def intensive_cart_and_order_flow(self):
        """Flujo intensivo de prueba del carrito y órdenes."""
        if self.token:
            self._intensive_cart_flow()

    def _intensive_cart_flow(self):
        """Ejecutar flujo intensivo del carrito."""
        # 1. Limpiar carrito
        self.client.delete("/api/v1/cart", headers=self.headers, name="/api/v1/cart (intensive clear)")
        
        # 2. Obtener eventos
        with self.client.get("/api/v1/events?limit=15", name="/api/v1/events (intensive flow)") as response:
            if response.status_code == 200 and response.json():
                events = response.json()
                if not events:
                    return
                event_id = random.choice(events)['id']
            else:
                return
        
        # 3. Obtener tipos de ticket
        with self.client.get(f"/api/v1/events/{event_id}/ticket-types", name="/api/v1/events/[id]/ticket-types (intensive)") as response:
            if response.status_code == 200 and response.json():
                ticket_types = response.json()
                if not ticket_types:
                    return
                ticket_type_ids = [ticket['id'] for ticket in ticket_types]
            else:
                return
        
        # 4. Agregar múltiples items
        items_to_add = min(random.randint(2, 4), len(ticket_type_ids))
        selected_tickets = random.sample(ticket_type_ids, items_to_add)
        
        for ticket_type_id in selected_tickets:
            cart_payload = {
                "ticketTypeId": str(ticket_type_id),
                "cantidad": random.randint(1, 3)
            }
            self.client.post("/api/v1/cart/items", json=cart_payload, headers=self.headers, name="/api/v1/cart/items (intensive add)")
        
        # 5. Revisar carrito
        with self.client.get("/api/v1/cart", headers=self.headers, name="/api/v1/cart (intensive review)") as response:
            if response.status_code == 200:
                cart_data = response.json()
                cart_items = cart_data.get('items', [])
                
                # Remover un item si hay más de 2
                if len(cart_items) > 2:
                    item_to_remove = random.choice(cart_items)
                    item_id = item_to_remove.get('itemId')
                    if item_id:
                        self.client.delete(f"/api/v1/cart/items/{item_id}", headers=self.headers, name="/api/v1/cart/items/[id] (intensive remove)")
        
        # 6. Crear orden
        order_payload = {
            "paymentMethodId": f"pm_card_{random.choice(['visa', 'mastercard', 'amex'])}",
            "billingAddress": {
                "nombreCompleto": f"Usuario Test {random.randint(1000, 9999)}",
                "identificacion": f"{random.randint(1000000000, 9999999999)}",
                "direccion": f"Calle {random.randint(1, 999)} #{random.randint(1, 99)}",
                "ciudad": random.choice(["Quito", "Guayaquil", "Cuenca", "Manta"]),
                "pais": "EC"
            }
        }
        with self.client.post("/api/v1/orders", json=order_payload, headers=self.headers, name="/api/v1/orders (intensive create)") as response:
            if response.status_code == 201:
                order_data = response.json()
                order_id = order_data.get('id')
                if order_id:
                    # Ver detalles de la orden creada
                    self.client.get(f"/api/v1/orders/{order_id}", headers=self.headers, name="/api/v1/orders/[id] (intensive review)")
        
        # 7. Ver tickets
        self.client.get("/api/v1/tickets", headers=self.headers, name="/api/v1/tickets (intensive view)")

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

    @task(3)
    def manage_cart(self):
        """Gestionar el carrito de compras."""
        if not self.token:
            return
        
        # Ver el carrito actual
        with self.client.get("/api/v1/cart", name="/api/v1/cart (view current)", headers=self.headers) as response:
            if response.status_code == 200:
                cart_data = response.json()
                cart_items = cart_data.get('items', [])
                
                # Si hay items en el carrito, ocasionalmente remover uno
                if cart_items and random.random() < 0.3:  # 30% de posibilidad
                    item_to_remove = random.choice(cart_items)
                    item_id = item_to_remove.get('itemId')
                    if item_id:
                        self.client.delete(f"/api/v1/cart/items/{item_id}", 
                                         name="/api/v1/cart/items/[id] (remove)", 
                                         headers=self.headers)
                
                # Ocasionalmente limpiar todo el carrito
                elif cart_items and random.random() < 0.1:  # 10% de posibilidad
                    self.client.delete("/api/v1/cart", 
                                     name="/api/v1/cart (clear all)", 
                                     headers=self.headers)

    @task(2)
    def add_single_item_to_cart(self):
        """Agregar un solo item al carrito como acción independiente."""
        if not self.token:
            return
            
        # Obtener eventos disponibles
        with self.client.get("/api/v1/events?limit=10", name="/api/v1/events (for single cart add)", headers=self.headers) as response:
            if response.status_code == 200 and response.json():
                events = response.json()
                if events:
                    event_id = random.choice(events)['id']
                    
                    # Obtener tipos de ticket para este evento
                    with self.client.get(f"/api/v1/events/{event_id}/ticket-types", name="/api/v1/events/[id]/ticket-types (for cart)", headers=self.headers) as ticket_response:
                        if ticket_response.status_code == 200 and ticket_response.json():
                            ticket_types = ticket_response.json()
                            if ticket_types:
                                ticket_type_id = random.choice(ticket_types)['id']
                                
                                # Agregar al carrito
                                cart_payload = {
                                    "ticketTypeId": str(ticket_type_id),
                                    "cantidad": 1
                                }
                                self.client.post("/api/v1/cart/items", 
                                               json=cart_payload, 
                                               headers=self.headers, 
                                               name="/api/v1/cart/items (add single)")

    @task(1)
    def request_order_refund(self):
        """Solicitar reembolso de una orden (ocasionalmente)."""
        if not self.token:
            return
            
        # Obtener órdenes del usuario
        with self.client.get("/api/v1/orders", name="/api/v1/orders (for refund)", headers=self.headers) as response:
            if response.status_code == 200 and response.json():
                orders = response.json().get('data', [])
                if orders:
                    # Seleccionar una orden aleatoria para solicitar reembolso
                    order_to_refund = random.choice(orders)
                    order_id = order_to_refund['id']
                    
                    refund_payload = {
                        "motivo": random.choice([
                            "Cancelación del evento",
                            "No puedo asistir",
                            "Compra duplicada",
                            "Cambio de planes"
                        ]),
                        "detalles": "Solicitud de reembolso generada automáticamente por Locust"
                    }
                    
                    self.client.post(f"/api/v1/orders/{order_id}/refund", 
                                   json=refund_payload, 
                                   headers=self.headers, 
                                   name="/api/v1/orders/[id]/refund (request)")

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
            self._organizer_event_flow()

    def _organizer_event_flow(self):
        """Ejecutar flujo de creación de eventos."""
        # 1. Crear venue
        venue_payload = {
            "nombre": f"Venue Creado por Locust {random.randint(1000, 9999)}",
            "direccion": "Av. de la Simulación 123",
            "ciudad": "Quito",
            "pais": "EC"
        }
        with self.client.post("/api/v1/venues", json=venue_payload, headers=self.headers, name="/api/v1/venues (organizer create)") as response:
            if response.status_code == 201:
                venue_id = response.json().get('id')
            else:
                return
        
        # 2. Obtener categoría
        with self.client.get("/api/v1/categories", name="/api/v1/categories (organizer get)") as response:
            if response.status_code == 200 and response.json():
                category_id = random.choice(response.json())['id']
            else:
                return
        
        # 3. Crear evento
        event_payload = {
            "nombre": f"Evento de Prueba Locust {random.randint(1000, 9999)}",
            "descripcion": "Este es un evento de prueba generado automáticamente por Locust para pruebas de carga.",
            "fechaInicio": "2025-12-01T20:00:00Z",
            "fechaFin": "2025-12-01T23:00:00Z",
            "categoryId": str(category_id),
            "venueId": str(venue_id)
        }
        with self.client.post("/api/v1/events", json=event_payload, headers=self.headers, name="/api/v1/events (organizer create)") as response:
            if response.status_code == 201:
                event_id = response.json().get('id')
            else:
                return
        
        # 4. Publicar evento
        self.client.post(f"/api/v1/events/{event_id}/publish", headers=self.headers, name="/api/v1/events/[id]/publish (organizer)")