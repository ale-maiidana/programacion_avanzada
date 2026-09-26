import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { PaymentsService } from './payments.service';
import { CreatePaymentSessionDto } from './dto/create-payment-session.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment-session')
  createPaymentSession(@Body() dto: CreatePaymentSessionDto) {
    return this.paymentsService.createPaymentSession(dto);
  }

  @Get('success')
  @HttpCode(200)
  success() {
    return { ok: true, message: 'Payment successful' };
  }

  @Get('cancel')
  @HttpCode(200)
  cancel() {
    return { ok: false, message: 'Payment cancelled' };
  }

  @Post('webhook')
  @HttpCode(200)
  handleWebhook(@Req() req: RawBodyRequest<Request>) {
    const signature = req.headers['stripe-signature'];
    if (!signature || Array.isArray(signature)) {
      throw new BadRequestException('Missing or invalid stripe-signature header');
    }

    if (!req.rawBody) {
      throw new BadRequestException('Missing raw body');
    }

    const event = this.paymentsService.constructWebhookEvent(req.rawBody, signature);
    this.paymentsService.handleWebhookEvent(event);

    return { received: true };
  }
}