import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  voterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  electionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election',
    required: true
  },
  candidateId: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationMethod: {
    type: String,
    enum: ['email', 'sms', 'biometric', 'manual'],
    default: 'email'
  },
  metadata: {
    deviceType: String,
    location: String,
    sessionId: String
  },
  isCancelled: {
    type: Boolean,
    default: false
  },
  cancelledAt: {
    type: Date
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellationReason: {
    type: String
  }
}, {
  timestamps: true
});

// Compound index to ensure one vote per voter per election
voteSchema.index({ voterId: 1, electionId: 1 }, { unique: true });

// Indexes for better performance
voteSchema.index({ electionId: 1 });
voteSchema.index({ candidateId: 1 });
voteSchema.index({ timestamp: 1 });
voteSchema.index({ isVerified: 1 });

// Virtual for vote age
voteSchema.virtual('ageInMinutes').get(function() {
  const now = new Date();
  const diffInMs = now.getTime() - this.timestamp.getTime();
  return Math.floor(diffInMs / (1000 * 60));
});

// Method to check if vote can be cancelled
voteSchema.methods.canBeCancelled = function() {
  const now = new Date();
  const timeDiff = now.getTime() - this.timestamp.getTime();
  const hoursDiff = timeDiff / (1000 * 60 * 60);
  
  // Allow cancellation within 24 hours
  return hoursDiff <= 24 && !this.isCancelled;
};

// Method to cancel vote
voteSchema.methods.cancelVote = function(cancelledBy, reason) {
  if (!this.canBeCancelled()) {
    throw new Error('Vote cannot be cancelled after 24 hours or if already cancelled');
  }
  
  this.isCancelled = true;
  this.cancelledAt = new Date();
  this.cancelledBy = cancelledBy;
  this.cancellationReason = reason;
  
  return this.save();
};

// Static method to get vote statistics for an election
voteSchema.statics.getElectionStats = async function(electionId) {
  const stats = await this.aggregate([
    { $match: { electionId: new mongoose.Types.ObjectId(electionId), isCancelled: false } },
    {
      $group: {
        _id: '$candidateId',
        count: { $sum: 1 },
        verifiedVotes: {
          $sum: { $cond: ['$isVerified', 1, 0] }
        },
        unverifiedVotes: {
          $sum: { $cond: ['$isVerified', 0, 1] }
        }
      }
    }
  ]);
  
  return stats;
};

// Static method to get total votes for an election
voteSchema.statics.getTotalVotes = async function(electionId) {
  const result = await this.aggregate([
    { $match: { electionId: new mongoose.Types.ObjectId(electionId), isCancelled: false } },
    { $group: { _id: null, total: { $sum: 1 } } }
  ]);
  
  return result.length > 0 ? result[0].total : 0;
};

// Static method to check if user has voted in an election
voteSchema.statics.hasUserVoted = async function(voterId, electionId) {
  const vote = await this.findOne({
    voterId: new mongoose.Types.ObjectId(voterId),
    electionId: new mongoose.Types.ObjectId(electionId),
    isCancelled: false
  });
  
  return !!vote;
};

// Ensure virtual fields are serialized
voteSchema.set('toJSON', { virtuals: true });

const Vote = mongoose.model('Vote', voteSchema);

export default Vote; 