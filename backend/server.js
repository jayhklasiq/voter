import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Path to ballot.json file
const BALLOT_FILE = path.join(process.cwd(), '..', 'data', 'ballot.json');

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Frontend URL
  credentials: true
}));
app.use(express.json());

// Email configuration
let transporter = null;

const initializeEmailService = () => {
  const gmailUser = process.env.USER_EMAIL;
  const gmailPassword = process.env.USER_PW;

  if (!gmailUser || !gmailPassword) {
    console.warn('⚠️  Gmail credentials not configured. Email service will not work.');
    console.warn('   Please set USER_EMAIL and USER_PW environment variables.');
    return false;
  }

  try {
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: gmailUser,
        pass: gmailPassword
      }
    });

    // Verify connection
    transporter.verify((error) => {
      if (error) {
        console.error('❌ SMTP configuration error:', error.message);
        transporter = null;
      } else {
        console.log('✅ SMTP server is ready to send emails');
      }
    });

    return true;
  } catch (error) {
    console.error('❌ Failed to initialize email service:', error.message);
    return false;
  }
};

// Initialize email service
const emailServiceReady = initializeEmailService();

// For testing without Gmail credentials, we'll use a mock service
const useMockService = !emailServiceReady;

// Vote storage functions
const readBallotData = () => {
  try {
    if (fs.existsSync(BALLOT_FILE)) {
      const data = fs.readFileSync(BALLOT_FILE, 'utf8');
      return JSON.parse(data);
    }
    return {
      votes: [],
      metadata: {
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        totalVotes: 0,
        version: "1.0.0"
      }
    };
  } catch (error) {
    console.error('❌ Error reading ballot data:', error.message);
    return {
      votes: [],
      metadata: {
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        totalVotes: 0,
        version: "1.0.0"
      }
    };
  }
};

const writeBallotData = (ballotData) => {
  try {
    ballotData.metadata.lastUpdated = new Date().toISOString();
    ballotData.metadata.totalVotes = ballotData.votes.length;
    fs.writeFileSync(BALLOT_FILE, JSON.stringify(ballotData, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Error writing ballot data:', error.message);
    return false;
  }
};

const addVote = (voteData) => {
  const ballotData = readBallotData();

  // Check if voter has already voted
  const existingVoter = ballotData.votes.find(voter => voter.voterEmail === voteData.voterEmail);
  if (existingVoter) {
    return { success: false, message: 'Voter has already cast a ballot' };
  }

  // Add new voter with their votes
  ballotData.votes.push({
    voterEmail: voteData.voterEmail,
    timestamp: new Date().toISOString(),
    votes: voteData.votes || [voteData] // Support both single vote and multiple votes
  });

  if (writeBallotData(ballotData)) {
    return { success: true, message: 'Vote recorded successfully' };
  } else {
    return { success: false, message: 'Failed to record vote' };
  }
};

const getVotes = () => {
  const ballotData = readBallotData();
  return ballotData.votes;
};

const getVoteStats = () => {
  const ballotData = readBallotData();
  return {
    totalVotes: ballotData.votes.length,
    lastUpdated: ballotData.metadata.lastUpdated,
    version: ballotData.metadata.version
  };
};

// Health check endpoint
app.get('/api/email/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Email API',
    emailService: emailServiceReady ? 'Ready' : 'Mock Service',
    mode: useMockService ? 'Development (Mock)' : 'Production (Gmail)'
  });
});

// Send email endpoint
app.post('/api/email/send', async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;

    // Validate required fields
    if (!to || !subject || !html) {
      return res.status(400).json({
        error: 'Missing required fields: to, subject, html'
      });
    }

    if (useMockService) {
      // Mock service for development
      console.log('📧 Mock Email Service - Sending OTP Email:');
      console.log('   To:', to);
      console.log('   Subject:', subject);
      console.log('   HTML:', html.substring(0, 100) + '...');
      console.log('---');

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      res.json({
        success: true,
        messageId: 'mock-' + Date.now(),
        message: 'Mock email sent successfully (check console for OTP)'
      });
    } else {
      // Real email service
      if (!transporter) {
        return res.status(503).json({
          error: 'Email service not configured. Please check server logs.'
        });
      }

      const info = await transporter.sendMail({
        from: `"SPE UNIBEN Elections" <${process.env.USER_EMAIL}>`,
        to,
        subject,
        html,
        text
      });

      console.log('📧 Email sent successfully:', info.messageId);
      console.log('   To:', to);
      console.log('   Subject:', subject);

      res.json({
        success: true,
        messageId: info.messageId,
        message: 'Email sent successfully'
      });
    }
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    res.status(500).json({
      error: 'Failed to send email',
      details: error.message
    });
  }
});

// Test endpoint
app.get('/api/email/test', async (req, res) => {
  if (!transporter) {
    return res.status(503).json({
      error: 'Email service not configured'
    });
  }

  try {
    const testEmail = process.env.USER_EMAIL;
    const testOTP = Math.floor(100000 + Math.random() * 900000).toString();

    const info = await transporter.sendMail({
      from: `"SPE UNIBEN Elections Test" <${testEmail}>`,
      to: testEmail,
      subject: 'SPE UNIBEN Elections - Test Email',
      html: `
        <h1>Test Email Successful!</h1>
        <p>This is a test email from the SPE UNIBEN Elections system.</p>
        <p><strong>Test OTP:</strong> <span style="font-size: 24px; color: #667eea;">${testOTP}</span></p>
        <p>Time: ${new Date().toLocaleString()}</p>
      `,
      text: `
        Test Email Successful!
        
        This is a test email from the SPE UNIBEN Elections system.
        Test OTP: ${testOTP}
        Time: ${new Date().toLocaleString()}
      `
    });

    res.json({
      success: true,
      messageId: info.messageId,
      testOTP,
      message: 'Test email sent successfully'
    });
  } catch (error) {
    console.error('❌ Test email error:', error.message);
    res.status(500).json({
      error: 'Failed to send test email',
      details: error.message
    });
  }
});

// Vote API endpoints
app.get('/api/votes/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Vote API',
    ballotFile: BALLOT_FILE,
    exists: fs.existsSync(BALLOT_FILE)
  });
});

app.get('/api/votes/stats', (req, res) => {
  try {
    const stats = getVoteStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get vote statistics',
      details: error.message
    });
  }
});

app.get('/api/votes', (req, res) => {
  try {
    const votes = getVotes();
    res.json({
      success: true,
      data: votes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get votes',
      details: error.message
    });
  }
});

app.post('/api/votes', (req, res) => {
  try {
    const { votes, voterEmail } = req.body;

    if (!votes || !Array.isArray(votes) || votes.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid vote data. Expected array of votes.'
      });
    }

    if (!voterEmail) {
      return res.status(400).json({
        success: false,
        error: 'Voter email is required.'
      });
    }

    // Add all votes for this voter as a single entry
    const result = addVote({
      voterEmail: voterEmail,
      votes: votes.map(vote => ({
        position: vote.position,
        candidateEmail: vote.candidateEmail,
        id: `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }))
    });

    if (result.success) {
      res.json({
        success: true,
        message: 'All votes recorded successfully',
        data: {
          votesRecorded: votes.length,
          voterEmail: voterEmail
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.message
      });
    }

  } catch (error) {
    console.error('❌ Vote submission error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to submit votes',
      details: error.message
    });
  }
});

app.get('/api/votes/check/:email', (req, res) => {
  try {
    const { email } = req.params;
    const votes = getVotes();
    const hasVoted = votes.some(voter => voter.voterEmail.toLowerCase() === email.toLowerCase());

    res.json({
      success: true,
      data: {
        hasVoted,
        voterEmail: email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to check vote status',
      details: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Email API server running on port ${PORT}`);
  console.log(`📧 Health check: http://localhost:${PORT}/api/email/health`);
  console.log(`🧪 Test email: http://localhost:${PORT}/api/email/test`);
  console.log(`📬 Frontend: http://localhost:5173`);

  if (!emailServiceReady) {
    console.log('\n⚠️  To enable email sending:');
    console.log('   1. Create a .env file in the backend directory');
    console.log('   2. Add your Gmail credentials:');
    console.log('      USER_EMAIL=your-email@gmail.com');
    console.log('      USER_PW=your-16-character-app-password');
    console.log('   3. Restart the server');
  }
});
