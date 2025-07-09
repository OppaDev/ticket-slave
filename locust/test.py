import random
from locust import HttpUser, task, between

# --- Datos de Prueba ---
# Estos datos se basan en tu archivo de seeder (ms-usuarios/api/db/seeders/...)
# Es crucial que estos usuarios y eventos existan en tu BBDD de pruebas.
CUSTOMER_CREDENTIALS = {"email": "customer@test.com", "password": "password"}
EVENT_IDS = [1, 2, 3]  # Asumiendo que los IDs de los eventos del seeder son 1, 2, y 3
TICKET_TYPE_IDS_PER_EVENT = {
    # Suponiendo que el seeder de eventos/tickets crea estos tipos de tickets.
    # Necesitas verificar los IDs reales en tu base de datos después de ejecutar los seeders.
    1: [1, 2], # TicketType IDs para el Evento 1
    2: [3, 4], # TicketType IDs para el Evento 2
    3: [5, 6]  # TicketType IDs para el Evento 3
}


class TicketSlaveUser(HttpUser):
    # El host es la URL de tu API Gateway Kong
    host = "http://localhost:8000"
    
    # Simula un tiempo de espera entre 1 y 3 segundos entre tareas
    wait_time = between(1, 3)

    def on_start(self):
        """ Se ejecuta una vez por cada usuario virtual al inicio de la prueba. """
        self.token = None

    @task(10) # <-- Tarea 1: Navegación (más frecuente)
    def browse_events(self):
        """
        Simula a un usuario anónimo que navega por la lista de eventos.
        Es una operación de solo lectura y alta frecuencia.
        """
        self.client.get("/api/v1/events", name="/api/v1/events (browse)")

    @task(2) # <-- Tarea 2: Flujo de compra completo (menos frecuente pero más crítico)
    def full_purchase_flow(self):
        """
        Simula el flujo completo de un usuario registrado que compra un ticket.
        """
        # 1. Iniciar Sesión
        with self.client.post("/api/v1/auth/login", json=CUSTOMER_CREDENTIALS, name="/api/v1/auth/login") as response:
            if response.status_code == 200:
                self.token = response.json().get("token")
            else:
                response.failure(f"Failed to login with user {CUSTOMER_CREDENTIALS['email']}")
                return # Detener el flujo si el login falla

        if not self.token:
            return

        headers = {"Authorization": f"Bearer {self.token}"}

        # 2. Seleccionar un evento al azar
        event_id = random.choice(EVENT_IDS)
        
        # 3. Ver los tipos de ticket para ese evento
        with self.client.get(f"/api/v1/events/{event_id}/ticket-types", name="/api/v1/events/[eventId]/ticket-types") as response:
            if response.status_code == 200 and response.json():
                # Obtenemos un tipo de ticket real para este evento
                available_ticket_types = response.json()
                ticket_type_to_buy = random.choice(available_ticket_types)
                ticket_type_id = ticket_type_to_buy['id']
            else:
                response.failure(f"Could not get ticket types for event {event_id}")
                return

        # 4. Añadir ticket al carrito
        cart_payload = {
            "ticketTypeId": str(ticket_type_id), # El DTO espera un string
            "cantidad": random.randint(1, 2)
        }
        with self.client.post("/api/v1/cart/items", json=cart_payload, headers=headers, name="/api/v1/cart/items (add)") as response:
            if response.status_code != 200:
                response.failure(f"Failed to add item to cart. Payload: {cart_payload}")
                return

        # 5. Crear la orden (comprar)
        order_payload = {
            "paymentMethodId": "pm_card_visa", # Simulación de un método de pago exitoso
            "billingAddress": {
                "nombreCompleto": "Usuario de Prueba Locust",
                "identificacion": "9999999999",
                "direccion": "Calle Falsa 123",
                "ciudad": "Locustown",
                "pais": "EC"
            }
        }
        with self.client.post("/api/v1/orders", json=order_payload, headers=headers, name="/api/v1/orders (create)") as response:
            if response.status_code != 201:
                response.failure(f"Failed to create order. Status: {response.status_code}, Text: {response.text}")
                return