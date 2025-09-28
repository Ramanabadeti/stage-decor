import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";
import { useRef } from "react";
import galleryImages from "./galleryData";
import "./App.css";

function Section({ id, title, children, bgImage }) {
  return (
    <section
      id={id}
      className="min-h-screen py-16 px-6 text-white snap-start bg-cover bg-center bg-no-repeat"
      style={bgImage ? { backgroundImage: `url(${bgImage})` } : {}}
    >
      <div className="bg-gradient-to-br from-black/70 to-pink-800/70 p-8 rounded-xl max-w-6xl mx-auto shadow-xl">
        <motion.h2
          className="text-5xl font-extrabold mb-8 text-center text-pink-300 drop-shadow-lg"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
        >
          {title}
        </motion.h2>
        <motion.div
          className="text-xl leading-relaxed drop-shadow-md"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
}

export default function App() {
  const form = useRef();

  const sendEmail = (e) => {
    e.preventDefault();
    emailjs
      .sendForm("service_tg8t50h", "template_z4ziarc", form.current, "bfzg_N3Jx3h92YwQV")
      .then(
        (result) => {
          alert("Message sent successfully!");
        },
        (error) => {
          alert("Failed to send message. Try again later.");
        }
      );
  };

  return (
    <div className="snap-y snap-mandatory h-screen overflow-scroll scroll-smooth bg-black">
      <header className="fixed w-full bg-gradient-to-r from-pink-800 via-black to-pink-800 text-white p-4 z-50 shadow-lg">
        <nav className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-wider">StageDecor</h1>
          <ul className="flex gap-6 font-medium text-pink-100">
            <li><a href="#home" className="hover:text-white transition">Home</a></li>
            <li><a href="#about" className="hover:text-white transition">About</a></li>
            <li><a href="#gallery" className="hover:text-white transition">Gallery</a></li>
            <li><a href="#services" className="hover:text-white transition">Services</a></li>
            <li><a href="#equipment" className="hover:text-white transition">Equipment</a></li>
            <li><a href="#contact" className="hover:text-white transition">Contact</a></li>
          </ul>
        </nav>
      </header>

      <Section id="home" title="Welcome to StageDecor" bgImage="/dec1.jpg">
        <p>Your one-stop solution for stunning stage decorations.</p>
      </Section>

      <Section id="about" title="About Us" bgImage="/dec2.jpg">
        <p>
          We specialize in creative, elegant stage decorations for weddings, birthdays,
          and corporate events. With years of experience and all the necessary equipment,
          we bring your vision to life.
        </p>
      </Section>

      <Section id="gallery" title="Gallery">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {galleryImages.map((img, index) => (
            <motion.img
              key={index}
              src={`/${img}`}   // automatically loads from public folder
              alt={`Decoration ${index + 1}`}
              className="rounded-xl shadow-2xl border-4 border-pink-300"
              whileHover={{ scale: 1.05, rotate: index % 2 === 0 ? 1 : -1 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          ))}
        </div>
      </Section>

      <Section id="services" title="Our Services">
        <ul className="list-disc pl-6 space-y-2 text-pink-100">
          <li>Wedding Stage Decoration</li>
          <li>Birthday Party Setups</li>
          <li>Lighting and Sound Arrangement</li>
          <li>Theme-based Stage Designs</li>
        </ul>
      </Section>

      <Section id="equipment" title="Our Equipment">
        <p>
          We own high-quality backdrops, lights, flowers, drapes, and props to create any look you want.
        </p>
      </Section>

      <Section id="contact" title="Contact Us">
        <form ref={form} onSubmit={sendEmail} className="flex flex-col gap-4 max-w-md mx-auto">
          <input type="text" name="user_name" placeholder="Customer Name" className="border-2 border-pink-500 p-2 rounded text-black" required />
          <input type="text" name="event_type" placeholder="Type of Event (e.g., Wedding, Birthday)" className="border-2 border-pink-500 p-2 rounded text-black" required />
          <input type="date" name="event_date" className="border-2 border-pink-500 p-2 rounded text-black" required />
          <input type="time" name="event_time" className="border-2 border-pink-500 p-2 rounded text-black" required />
          <input type="text" name="event_place" placeholder="Event Place" className="border-2 border-pink-500 p-2 rounded text-black" required />
          <input type="tel" name="user_phone" placeholder="Mobile Number" className="border-2 border-pink-500 p-2 rounded text-black" required />
          <input type="email" name="user_email" placeholder="Email Address" className="border-2 border-pink-500 p-2 rounded text-black" required />
          <textarea name="message" placeholder="Additional Requirements" className="border-2 border-pink-500 p-2 rounded text-black"></textarea>
          <button type="submit" className="bg-pink-700 hover:bg-pink-600 text-white p-2 rounded shadow-lg transition">Send</button>
        </form>
      </Section>

      <footer className="bg-gradient-to-r from-black via-pink-800 to-black text-white p-4 text-center">
        <div>
          <p>MAUMUD MUBSHAR</p>
          <p>4145422294</p>
        </div>
        &copy; {new Date().getFullYear()} StageDecor. All rights reserved.
      </footer>
    </div>
  );
}
