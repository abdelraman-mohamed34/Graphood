import { provisionOrder } from "./provision-order.service";
import { createAdminClient } from "../../admin";

export async function confirmOrderPayment(
    orderId: string,
    transactionRef: string
) {
    const supabase = createAdminClient();

    console.log("STEP 1 - CONFIRM PAYMENT", orderId);

    const { error: paymentError } = await supabase
        .from("payments")
        .update({
            status: "SUCCESS",
            transaction_ref: transactionRef,
            paid_at: new Date(),
        })
        .eq("order_id", orderId);

    if (paymentError) throw paymentError;


    console.log("STEP 2 - PAYMENT DONE");

    const { data: updatedOrder, error: orderError } =
        await supabase
            .from("orders")
            .update({
                status: "PAID",
            })
            .eq("id", orderId)
            .select()
            .single();


    if (orderError) throw orderError;


    console.log(
        "STEP 3 - ORDER PAID",
        updatedOrder.id
    );

    const provisioning = await provisionOrder({
        orderId,
    });


    console.log("STEP 4 - PROVISION DONE");


    return {
        order: updatedOrder,
        ...provisioning,
    };
}