import generateKitchenOrderID from "../../util/generateKitchenOrderID.js";
import {
  decodeCartOpaqueId,
  decodeFulfillmentMethodOpaqueId,
  decodeOrderItemsOpaqueIds,
  decodeShopOpaqueId,
} from "../../xforms/id.js";

/**
 * @name Mutation/placeOrder
 * @method
 * @memberof Payments/GraphQL
 * @summary resolver for the placeOrder GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {Object} args.input.order - The order input
 * @param {Object[]} args.input.payments - Payment info
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} PlaceOrderPayload
 */
export default async function placeOrder(parentResult, { input }, context) {
  // console.log("input:- ", input)
  const today = new Date().toISOString().substr(0, 10);
  const { clientMutationId = null, order, payments, branchID, notes } = input;
  const {
    cartId: opaqueCartId,
    fulfillmentGroups,
    shopId: opaqueShopId,
  } = order;
  // const { Orders } = context.collections;
  // const query = { todayDate: today, branchID };

  // const generatedID = await generateKitchenOrderID(query, Orders);
  // console.log("Generated ID :- ", generatedID)
  // const kitchenOrderID = generatedID;
  // const todayDate = today;
  const cartId = opaqueCartId ? decodeCartOpaqueId(opaqueCartId) : null;
  const shopId = decodeShopOpaqueId(opaqueShopId);

  const transformedFulfillmentGroups = fulfillmentGroups.map((group) => ({
    ...group,
    items: decodeOrderItemsOpaqueIds(group.items),
    selectedFulfillmentMethodId: decodeFulfillmentMethodOpaqueId(
      group.selectedFulfillmentMethodId
    ),
    shopId: decodeShopOpaqueId(group.shopId),
  }));

  const { orders, token } = await context.mutations.placeOrder(context, {
    order: {
      ...order,
      cartId,
      fulfillmentGroups: transformedFulfillmentGroups,
      shopId,

      notes,
    },
    payments,
    branchID,
    notes,
  });
  // console.log("order:- ", order);
  return {
    clientMutationId,
    orders,
    token,
    notes,
  };
}
