const { Prisma } = require("@prisma/client");
const prisma = require("../utils/prisma");

const createCustomer = async (req, res) => {
  const { name, phone, email } = req.body;

  if (!name || !phone || !email) {
    return res.status(400).json({
      error: "Missing fields in request body",
    });
  }

  try {
    const createdCustomer = await prisma.customer.create({
      data: {
        name,
        contact: {
          create: {
            phone,
            email,
          },
        },
      },
      include: {
        contact: true,
      },
    });

    res.status(201).json({ customer: createdCustomer });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return res
          .status(409)
          .json({ error: "A customer with the provided email already exists" });
      }
    }

    res.status(500).json({ error: e.message });
  }
};

const updateCustomer = async (req, res) => {
  const { name, contact } = req.body;
  const customerId = Number(req.params.id);
  let phone, email;
  if (contact) {
    phone = contact.phone;
    email = contact.email;
  }
  if (!name) {
    return res.status(400).json({
      error: "Missing fields in request body",
    });
  }
  const foundCustomer = await prisma.customer.findFirst({
    where: { id: customerId },
  });
  if (!foundCustomer) {
    res.status(404).json({ error: "Customer with that id does not exist" });
  }
  try {
    const updatedCustomer = await prisma.customer.update({
      data: {
        name: name,
        contact: {
          update: {
            phone,
            email,
          },
        },
      },
      where: { id: customerId },
      include: { contact: true },
    });
    res.status(201).json({ customer: updatedCustomer });
  } catch (e) {}
};

module.exports = {
  createCustomer,
  updateCustomer,
};
