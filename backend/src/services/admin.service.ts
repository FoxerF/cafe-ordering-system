import { prisma } from "../lib/prisma.js";

export async function getAdminDashboardSummary() {
  const now = new Date();

  const [
    activeOrders,
    preparingOrders,
    readyOrders,
    slots,
  ] = await Promise.all([
    prisma.order.count({
      where: {
        status: {
          in: [
            "NEW",
            "CONFIRMED",
            "PREPARING",
          ],
        },
      },
    }),

    prisma.order.count({
      where: {
        status: "PREPARING",
      },
    }),

    prisma.order.count({
      where: {
        status: "READY",
      },
    }),

    prisma.pickupSlot.findMany({
      where: {
        isActive: true,
        startsAt: {
          gt: now,
        },
      },
      orderBy: {
        startsAt: "asc",
      },
      take: 10,
    }),
  ]);

  const upcomingSlots =
    await Promise.all(
      slots.map(async (slot) => {
        const currentOrders =
          await prisma.order.count({
            where: {
              pickupSlotId: slot.id,
              status: {
                not: "CANCELLED",
              },
            },
          });

        return {
          id: slot.id,
          startsAt: slot.startsAt,
          endsAt: slot.endsAt,
          maxOrders: slot.maxOrders,
          currentOrders,
          remainingOrders:
            Math.max(
              slot.maxOrders -
                currentOrders,
              0,
            ),
          };
      }),
    );

  return {
    activeOrders,
    preparingOrders,
    readyOrders,
    upcomingSlots,
  };
}