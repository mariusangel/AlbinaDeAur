const mongoose = require('mongoose');
const Product = require('./models/Product');
const oldProducts = require('./old-products.json'); // Exportă din vechiul tău sistem

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Șterge datele existente
  await Product.deleteMany();
  
  // Adaugă noile produse
  const newProducts = oldProducts.map(p => ({
    name: p.name,
    description: p.description,
    price: parseFloat(p.price.replace('RON', '')),
    image: p.image,
    category: p.category
  }));
  
  await Product.insertMany(newProducts);
  console.log('Migrare completă!');
  process.exit();
}

migrate();