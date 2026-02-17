import dotenv from "dotenv";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import Ticket from "./models/Ticket.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Mongo Connected"))
  .catch(err => console.log(err));

/* ------------------ TAMBOLA GENERATOR ------------------ */

function getColumnRange(col) {
  if (col === 0) return [1, 9];
  if (col === 8) return [80, 90];
  return [col * 10, col * 10 + 9];
}

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function generateTicket() {
  const ticket = Array.from({ length: 3 }, () => Array(9).fill(null));

  let rowCounts = [0, 0, 0];
  let colCounts = Array(9).fill(1);

  let remaining = 6;

  while (remaining > 0) {
    let col = Math.floor(Math.random() * 9);
    if (colCounts[col] < 3) {
      colCounts[col]++;
      remaining--;
    }
  }

  for (let col = 0; col < 9; col++) {
    let count = colCounts[col];
    let [min, max] = getColumnRange(col);

    let numbers = [];
    while (numbers.length < count) {
      let num = Math.floor(Math.random() * (max - min + 1)) + min;
      if (!numbers.includes(num)) numbers.push(num);
    }

    numbers.sort((a, b) => a - b);

    let rows = shuffle([0, 1, 2]);

    for (let i = 0; i < count; i++) {
      for (let r of rows) {
        if (rowCounts[r] < 5 && ticket[r][col] === null) {
          ticket[r][col] = numbers[i];
          rowCounts[r]++;
          break;
        }
      }
    }
  }

  return ticket;
}

function ticketToString(ticket) {
  return JSON.stringify(ticket);
}

/* ------------------ SEED FUNCTION ------------------ */

async function seedTickets() {
  try {
    await Ticket.deleteMany();

    const uniqueTickets = new Set();
    const tickets = [];

    while (tickets.length < 40) {
      const ticket = generateTicket();
      const str = ticketToString(ticket);

      if (!uniqueTickets.has(str)) {
        uniqueTickets.add(str);
        tickets.push(ticket);
      }
    }

    for (let i = 0; i < tickets.length; i++) {
      await Ticket.create({
        ticketId: `TICKET_${i + 1}`,
        token: uuidv4(),
        numbers: tickets[i]
      });
    }

    console.log("40 Unique Tambola Tickets Created ✅");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedTickets();