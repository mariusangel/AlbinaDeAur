const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Numele produsului este obligatoriu'],
    trim: true,
    maxlength: [100, 'Numele nu poate depăși 100 de caractere']
  },
  description: {
    type: String,
    required: [true, 'Descrierea produsului este obligatorie'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Prețul produsului este obligatoriu'],
    min: [0, 'Prețul nu poate fi negativ'],
    set: v => Math.round(v * 100) / 100 // Rotunjire la 2 zecimale
  },
  category: {
    type: String,
    required: [true, 'Categoria produsului este obligatorie'],
    enum: {
      values: ['Miere', 'ProduseApicole', 'AlteProduse'],
      message: 'Categorie invalidă'
    }
  },
  tag: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    required: [true, 'Imaginea produsului este obligatorie'],
    validate: {
      validator: function(v) {
        return /^(http|https):\/\/[^ "]+$/.test(v);
      },
      message: props => `${props.value} nu este o URL validă pentru imagine!`
    }
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: [0, 'Stocul nu poate fi negativ']
  },
  specifications: {
    type: Map,
    of: String
  },
  nutritionalValues: {
    type: Map,
    of: String
  },
  detailedDescription: [{
    text: {
      type: String,
      trim: true
    },
    image: {
      type: String,
      validate: {
        validator: function(v) {
          return /^(http|https):\/\/[^ "]+$/.test(v);
        },
        message: props => `${props.value} nu este o URL validă pentru imagine!`
      }
    }
  }],
  isFeatured: {
    type: Boolean,
    default: false
  },
  isBestSelling: {
    type: Boolean,
    default: false
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Actualizează updatedAt la fiecare salvare
ProductSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index pentru căutare rapidă
ProductSchema.index({ name: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Product', ProductSchema);