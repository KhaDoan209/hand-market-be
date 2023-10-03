import { CreateCreditCardDTO } from "src/application/dto/credit-card.dto";
export interface CreditCardRepository {
   createNewCard(id: number, paymentMethodId: string): Promise<any>;
}