import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  party: {
    type: String,
    required: true,
    trim: true
  },
  symbol: {
    type: String,
    required: true,
    trim: true
  },
  aadharId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  image: {
    type: String,
    default: null
  },
  description: {
    type: String,
    trim: true
  },
  manifesto: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const electionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  candidates: [candidateSchema],
  totalVotes: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requirements: {
    minimumAge: {
      type: Number,
      default: 18
    },
    allowedGenders: [{
      type: String,
      enum: ['male', 'female', 'other']
    }],
    allowedDistricts: [{
      type: String,
      trim: true
    }]
  },
  settings: {
    allowMultipleVotes: {
      type: Boolean,
      default: false
    },
    requirePhotoId: {
      type: Boolean,
      default: true
    },
    showResultsBeforeEnd: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
electionSchema.index({ status: 1 });
electionSchema.index({ startDate: 1 });
electionSchema.index({ endDate: 1 });
electionSchema.index({ createdBy: 1 });

// Virtual for checking if election is currently active
electionSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date();
  return this.status === 'active' && 
         now >= this.startDate && 
         now <= this.endDate;
});

// Virtual for checking if election has ended
electionSchema.virtual('hasEnded').get(function() {
  const now = new Date();
  return now > this.endDate;
});

// Method to update election status based on dates
electionSchema.methods.updateStatus = function() {
  const now = new Date();
  
  if (this.status === 'cancelled') {
    return this.status;
  }
  
  if (now < this.startDate) {
    this.status = 'upcoming';
  } else if (now >= this.startDate && now <= this.endDate) {
    this.status = 'active';
  } else {
    this.status = 'completed';
  }
  
  return this.status;
};

// Pre-save middleware to validate dates
electionSchema.pre('save', function(next) {
  if (this.startDate >= this.endDate) {
    return next(new Error('End date must be after start date'));
  }
  
  if (this.startDate <= new Date()) {
    return next(new Error('Start date must be in the future'));
  }
  
  next();
});

// Ensure virtual fields are serialized
electionSchema.set('toJSON', { virtuals: true });

const Election = mongoose.model('Election', electionSchema);

export default Election; 