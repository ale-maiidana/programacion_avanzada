import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { CreatePaymentSessionDto } from './dto/create-payment-session.dto';

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET')!);
  }

  async createPaymentSession(dto: CreatePaymentSessionDto) {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: dto.items.map((item) => ({
        price_data: {
          currency: dto.currency,
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      payment_intent_data: {
        metadata: { orderId: dto.orderId },
      },
      success_url: this.configService.get<string>('STRIPE_SUCCESS_URL')!,
      cancel_url: this.configService.get<string>('STRIPE_CANCEL_URL')!,
    });

    return { id: session.id, url: session.url };
  }

   constructWebhookEvent(rawBody: Buffer, signature: string): Stripe.Event {
    const endpointSecret = this.configService.get<string>('STRIPE_ENDPOINT_SECRET')!;
    try {
      return this.stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      throw new BadRequestException(`Webhook signature verification failed: ${message}`);
    }
  }

  handleWebhookEvent(event: Stripe.Event) {
    if (event.type === 'charge.succeeded') {
      const charge = event.data.object as Stripe.Charge;
      const orderId = charge.metadata?.orderId;
      console.log(`✅ Pago confirmado para orderId: ${orderId}`);
    } else {
      console.log(`ℹ️ Evento no manejado: ${event.type}`);
    }
  }
}