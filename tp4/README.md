# Payments MS — Sesiones de pago y webhook Stripe

Microservicio HTTP en NestJS que crea sesiones de pago con Stripe Checkout y procesa el webhook de confirmación de cobro.

## Cómo levantar el proyecto

1. Instalar dependencias:
```bash
   npm install
```

2. Copiar `.env.template` a `.env` y completar con tus propios valores:
```bash
   cp .env.template .env
```
   - `STRIPE_SECRET`: tu clave secreta de test (dashboard de Stripe → Developers → API keys)
   - `STRIPE_ENDPOINT_SECRET`: se obtiene al correr `stripe listen` (ver abajo)
   - `STRIPE_SUCCESS_URL` / `STRIPE_CANCEL_URL`: URLs de redirección tras el pago

3. Levantar el servidor:
```bash
   npm run start:dev
```
   El servidor escucha en el puerto `3003` (configurable con `PORT`).

4. En otra terminal, levantar el listener de webhooks de Stripe CLI:
```bash
   stripe listen --events charge.succeeded --forward-to localhost:3003/payments/webhook
```
   Copiar el `whsec_...` que imprime y pegarlo en `STRIPE_ENDPOINT_SECRET` del `.env`.

## Rutas

### `POST /payments/create-payment-session`

Crea una Checkout Session en Stripe y devuelve `id` y `url` para redirigir al pago.

**Body:**
```json
{
  "orderId": "ord-1",
  "currency": "usd",
  "items": [
    { "name": "Producto", "price": 20, "quantity": 1 }
  ]
}
```

**Respuesta (200):**
```json
{ "id": "cs_test_...", "url": "https://checkout.stripe.com/..." }
```

Responde `400` si falta algún campo obligatorio, si `items` está vacío, o si se envían campos no contemplados en el DTO.

Rutas de apoyo (redirects de Stripe Checkout):
- `GET /payments/success` → `{ "ok": true, "message": "Payment successful" }`
- `GET /payments/cancel` → `{ "ok": false, "message": "Payment cancelled" }`

### `POST /payments/webhook`

Recibe notificaciones de Stripe cuando el pago se concreta. Verifica la firma del request (`stripe-signature`) contra el body crudo antes de procesar el evento.

- Si la firma es inválida → `400`, evento no procesado.
- Si el evento es `charge.succeeded` → extrae `metadata.orderId` y lo loguea.
- Otros tipos de evento → se loguean como "no manejado" y se responde `200` (para que Stripe no reintente).

## Fuera de alcance

Integración con el microservicio de órdenes, comunicación NATS/TCP, reembolsos y modo live de Stripe.
