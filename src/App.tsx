/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent, MouseEvent, useEffect } from 'react';
import { Check, Search } from 'lucide-react';
import { Task, Email } from './types';

const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Electricity bill payment',
    pillText: 'Due in 6 hours',
    urgency: 'high',
    context: 'Found in your inbox — no one reminded you about this.',
    primaryAction: 'Handle it now',
    secondaryAction: 'Snooze',
  },
  {
    id: 'task-2',
    title: 'Recommendation letter for Professor Sharma',
    pillText: '2 days overdue',
    urgency: 'high',
    context: "You promised this last week. It's slipping.",
    primaryAction: 'Draft a reply',
    secondaryAction: 'Snooze',
  },
  {
    id: 'task-3',
    title: 'Submit project proposal',
    pillText: 'Due in 2 days',
    urgency: 'medium',
    context: '5 smaller steps inside this. Best to start today.',
    primaryAction: 'Break it down',
    secondaryAction: 'Snooze',
  },
  {
    id: 'task-4',
    title: 'Renew gym membership',
    pillText: 'Due next week',
    urgency: 'low',
    context: 'Low priority. Handle it when you have a free moment.',
    primaryAction: 'Handle it now',
    secondaryAction: 'Snooze',
  },
];

const INITIAL_EMAILS: Email[] = [
  {
    id: 'email-1',
    from: 'Blaine, me',
    subject: 'Recent project updates',
    time: '2:25 PM',
    unread: true,
    avatarLetter: 'B',
    avatarColor: '#F28B82',
    starred: false,
    important: false,
    pillText: 'Projects',
    pillBg: '#0F9D58',
    pillColor: 'white',
    body: `Hi there,

Here are the recent project updates. Key highlights: the team has started on the key features of the new layout, we've aligned on the timeline, and the initial designs have been approved.

Please check the attached document for the full roadmap.

Best,
Blaine`,
  },
  {
    id: 'email-2',
    from: 'Clarence · Vijay · 13',
    subject: 'RSVP for team lunch and bike ride!',
    time: '1:35 PM',
    unread: true,
    avatarLetter: 'C',
    avatarColor: '#8AB4F8',
    starred: false,
    important: false,
    body: `Hey everyone,

We're pleased to announce that we will have our quarterly team lunch this Thursday, followed by a scenic bike ride along the river.

Please RSVP by tomorrow so we can finalize the catering numbers and bike rentals.

Looking forward to it!
Clarence & Vijay`,
  },
  {
    id: 'email-3',
    from: 'Clarence · John · 2',
    subject: 'Tickets: Ticket request #610007 has been approved!',
    time: '12:25 PM',
    unread: true,
    avatarLetter: 'C',
    avatarColor: '#8AB4F8',
    starred: false,
    important: false,
    pillText: 'Tickets',
    pillBg: '#4285F4',
    pillColor: 'white',
    body: `Hello,

Your ticket request #610007 has been approved! The access permissions will be updated automatically within the next 2 hours.

If you experience any issues accessing the systems, please reply to this thread or contact support.

Best regards,
IT Help Desk`,
  },
  {
    id: 'email-4',
    from: 'William, me · 4',
    subject: 'Thank you for your inquiry',
    time: 'April 17',
    unread: true,
    avatarLetter: 'W',
    avatarColor: '#81C995',
    starred: false,
    important: true,
    pillText: 'Support Archive',
    pillBg: '#E8F0FE',
    pillColor: '#1A73E8',
    body: `Dear Customer,

Thank you for your inquiry regarding our services. We have received your message and our team is already reviewing the details you provided.

We aim to respond to all inquiries within one business day. In the meantime, feel free to visit our online help center for quick answers.

Sincerely,
William`,
  },
  {
    id: 'email-5',
    from: 'Hilton Honors',
    subject: 'Your Upcoming Reservation #20983746',
    time: 'April 17',
    unread: false,
    avatarLetter: 'H',
    avatarColor: '#FDD663',
    starred: true,
    important: false,
    body: `Dear Tim Smith,

Thank you for choosing Hilton for your upcoming stay. Your reservation #20983746 has been successfully confirmed.

We look forward to welcoming you soon. If you need to make any changes to your reservation, please log in to your account or call our support line.

Warm regards,
Hilton Honors`,
  },
  {
    id: 'email-6',
    from: 'Virgin Atlantic',
    subject: 'Confirmation for Flight VA2345 SFO to NYC',
    time: 'April 17',
    unread: false,
    avatarLetter: 'V',
    avatarColor: '#C58AF9',
    starred: false,
    important: false,
    body: `Dear Passenger,

This is your official confirmation for Flight VA2345 from SFO to NYC on Wednesday, November 7th.

Please arrive at the terminal at least two hours prior to departure. Check-in is now open online and on our mobile app.

Safe travels,
Virgin Atlantic`,
  },
  {
    id: 'email-7',
    from: 'Jack',
    subject: "FW: What 'the future of innovation' Looks Like",
    time: 'April 17',
    unread: false,
    avatarLetter: 'J',
    avatarColor: '#FF8BCB',
    starred: false,
    important: false,
    body: `Hey,

A good read! Highly recommended checking out this article on what 'the future of innovation' looks like in our industry over the next decade.

Let's discuss this during our next sync.

Cheers,
Jack`,
  },
  {
    id: 'email-8',
    from: 'Xander',
    subject: 'Photos from my road trip',
    time: 'April 16',
    unread: false,
    avatarLetter: 'X',
    avatarColor: '#F28B82',
    starred: false,
    important: false,
    body: `Hi all,

Here are some highlights from my vacation. What an incredible journey through the mountains! The views were absolutely breathtaking and the weather was perfect.

Hope you enjoy the photos attached. Let's catch up soon!

Best,
Xander`,
  },
  {
    id: 'email-9',
    from: 'Richard, Matthew, me · 3',
    subject: 'Product Strategy classes',
    time: 'April 16',
    unread: false,
    avatarLetter: 'R',
    avatarColor: '#8AB4F8',
    starred: true,
    important: false,
    body: `Hi team,

He emailed me about his latest work. Here's what we reviewed in the product strategy classes yesterday. We need to focus more on user retention and simplify our onboarding flow.

Please review the shared slide deck and add your comments before Friday.

Best,
Richard`,
  },
  {
    id: 'email-10',
    from: 'Peter, Shalini · 2',
    subject: 'Business trip',
    time: 'April 16',
    unread: false,
    avatarLetter: 'P',
    avatarColor: '#81C995',
    starred: false,
    important: false,
    body: `Hi,

I made a reservation for the hotel you talked about. It looks fantastic and is located right in the center of the city.

I'll send over the itinerary as soon as the flights are fully confirmed.

Best,
Peter`,
  },
  {
    id: 'email-11',
    from: 'Roy, Alex, John Jose · 5',
    subject: 'Book you recommended',
    time: 'April 16',
    unread: false,
    avatarLetter: 'R',
    avatarColor: '#FDD663',
    starred: false,
    important: false,
    body: `Hey,

I am about to go on a trip and was hoping to learn more about the topics in that book you recommended. I just ordered a copy and can't wait to start reading.

Thanks again for the great suggestion!

Best,
Roy`,
  },
  {
    id: 'email-12',
    from: 'Google',
    subject: 'Security alert: New sign-in on Chrome',
    time: 'April 15',
    unread: true,
    avatarLetter: 'G',
    avatarColor: '#4285F4',
    starred: false,
    important: false,
    body: `Security Alert

Your Google Account was just used to sign in to Chrome on a Windows device.

If this was you, you don't need to do anything. If this wasn't you, please review your account activity immediately and secure your account.

Sincerely,
The Google Accounts Team`,
  },
  {
    id: 'email-13',
    from: 'GitHub',
    subject: 'Pull request merged: feat/dashboard-v2',
    time: 'April 15',
    unread: false,
    avatarLetter: 'G',
    avatarColor: '#24292E',
    textColor: 'white',
    starred: false,
    important: false,
    body: `GitHub Notification

prith46 merged your pull request #42 in polaris-app: feat/dashboard-v2.

All checks passed successfully and the deployment has completed. You can view the deployment logs in your Vercel or GitHub actions tab.

Thank you,
The GitHub Team`,
  },
  {
    id: 'email-14',
    from: 'Rahul Mehta',
    subject: 'Project sync — Thursday 4 PM',
    time: 'April 15',
    unread: false,
    avatarLetter: 'R',
    avatarColor: '#C58AF9',
    starred: false,
    important: false,
    body: `Hey,

Setting up our project sync for this Thursday at 4:00 PM over video call. We'll go over the proposal draft and divide up the remaining sections.

Come prepared with your part of the outline. Should take about an hour.

Thanks,
Rahul`,
  },
  {
    id: 'email-15',
    from: 'Prof. Anjali Sharma',
    subject: 'Following up on the recommendation letter',
    time: 'April 14',
    unread: false,
    avatarLetter: 'P',
    avatarColor: '#FF8BCB',
    starred: false,
    important: true,
    body: `Hi,

I hope you're doing well. I wanted to gently follow up on the recommendation letter you mentioned you'd send for my application. The deadline on my end was actually two days ago, so I'm a little worried.

If you can get it to me by tomorrow, I think we'll still be okay. Please let me know if anything's changed.

Best,
Prof. Sharma`,
  },
  {
    id: 'email-16',
    from: 'City Power & Utilities',
    subject: 'Your electricity bill is due soon',
    time: 'April 14',
    unread: false,
    avatarLetter: 'C',
    avatarColor: '#F28B82',
    starred: false,
    important: false,
    body: `Dear Customer,

This is a reminder that your electricity bill of ₹2,340 for the billing period of May is due on Friday, the 27th. To avoid a late fee and possible service interruption, please complete your payment before the due date.

You can pay online through our portal or at any authorized center.

Thank you,
City Power & Utilities`,
  },
  {
    id: 'email-17',
    from: 'Scholarship Office',
    subject: 'Welcome packet and a few next steps',
    time: 'April 14',
    unread: false,
    avatarLetter: 'S',
    avatarColor: '#FDD663',
    starred: false,
    important: false,
    body: `Hello,

Congratulations again on being shortlisted. We're excited to have you in the cohort this year and look forward to seeing what you'll build.

There's a lot to cover in orientation, and we'll share most details soon. Oh, and the enrollment confirmation form needs to be submitted before the 30th, otherwise we won't be able to hold your slot for the program.

Warm regards,
The Scholarship Office`,
  },
  {
    id: 'email-18',
    from: 'LinkedIn',
    subject: 'You appeared in 14 searches this week',
    time: 'April 13',
    unread: false,
    avatarLetter: 'L',
    avatarColor: '#0077B5',
    textColor: 'white',
    starred: false,
    important: false,
    body: `Hi there,

You appeared in 14 searches this week! Your profile is getting noticed by recruiters and hiring managers in your industry.

Click below to see who's been looking at your profile and what they do. Keep your profile updated to attract more opportunities.

Best regards,
The LinkedIn Team`,
  },
  {
    id: 'email-19',
    from: 'Swiggy',
    subject: 'Your order has been delivered!',
    time: 'April 13',
    unread: false,
    avatarLetter: 'S',
    avatarColor: '#FC8019',
    textColor: 'white',
    starred: false,
    important: false,
    body: `Swiggy Order Delivered

Hope you're enjoying your meal! Your order from 'The Good Bowl' has been successfully delivered to your doorstep.

Please take a moment to rate your delivery executive and the restaurant on our app.

Enjoy your food,
Team Swiggy`,
  },
  {
    id: 'email-20',
    from: 'Aman Gupta',
    subject: "Long time! How've you been?",
    time: 'April 12',
    unread: false,
    avatarLetter: 'A',
    avatarColor: '#81C995',
    starred: false,
    important: false,
    body: `Hey stranger,

It's been way too long! I was just thinking about our college days and figured I'd reach out. How have you been? How's everything going on your side?

We should catch up properly soon. No agenda, just a good chat.

Take care,
Aman`,
  },
  {
    id: 'email-21',
    from: 'DevWeekly',
    subject: 'This week in web development 🚀',
    time: 'April 12',
    unread: false,
    avatarLetter: 'D',
    avatarColor: '#8AB4F8',
    starred: false,
    important: false,
    body: `Welcome to this week's roundup!

Top stories: a new CSS feature lands in browsers, a deep dive into edge functions, and five open-source projects worth starring this weekend.

Grab a coffee and enjoy the read. See you next week!

— The DevWeekly Team`,
  },
  {
    id: 'email-22',
    from: 'Amazon',
    subject: 'Your order has shipped',
    time: 'April 11',
    unread: false,
    avatarLetter: 'A',
    avatarColor: '#FF9900',
    textColor: 'white',
    starred: false,
    important: false,
    body: `Amazon Shipping Confirmation

Great news! Your order #402-8821773-6382710 has been shipped and is on its way.

You can track your package using the link below. It is expected to arrive by Monday, April 14th.

Thank you for shopping with us,
Amazon.in`,
  },
  {
    id: 'email-23',
    from: 'Notion',
    subject: 'Weekly digest: 3 updates in your workspace',
    time: 'April 11',
    unread: false,
    avatarLetter: 'N',
    avatarColor: '#000000',
    textColor: 'white',
    starred: false,
    important: false,
    body: `Notion Weekly Digest

Here's what happened in your team workspace this week: 3 pages were updated, 2 new comments were left by your team members, and 1 document was archived.

Keep collaborating in Notion!

Cheers,
The Notion Team`,
  },
  {
    id: 'email-24',
    from: 'Vercel',
    subject: 'Deployment successful: polaris-app',
    time: 'April 10',
    unread: false,
    avatarLetter: 'V',
    avatarColor: '#000000',
    textColor: 'white',
    starred: false,
    important: false,
    body: `Vercel Deployment Confirmation

Your project polaris-app was successfully deployed to production.

- Branch: main
- URL: https://polaris-app.vercel.app
- Commit: feat(inbox): perfect gmail clone

Keep building,
The Vercel Team`,
  },
  {
    id: 'email-25',
    from: 'Mom',
    subject: "Call me when you're free ❤️",
    time: 'April 10',
    unread: false,
    avatarLetter: 'M',
    avatarColor: '#F28B82',
    starred: false,
    important: true,
    body: `Hi honey,

Just wanted to check in. Haven't heard from you in a while. Hope everything is going well with your classes and projects.

Call me when you have some free time. I'd love to hear how you're doing.

Love,
Mom`,
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'tasks' | 'calendar' | 'dashboard' | 'inbox'>('tasks');
  const [tasks, setTasks] = useState<Task[]>(() => {
    return INITIAL_TASKS.map(t => ({
      ...t,
      createdAt: Date.now(),
      subtasks: [],
      decomposing: false,
      decomposed: false,
      subtasksCollapsed: false
    }));
  });
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Custom states for new features
  const [completedCount, setCompletedCount] = useState(0);
  const [scannedCount, setScannedCount] = useState(0);
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(() => new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null);
  const [, setTimeTick] = useState(0);

  // States for Panic Mode & Focus Mode
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [focusedTaskTitle, setFocusedTaskTitle] = useState('');
  const [focusedReason, setFocusedReason] = useState('');
  const [focusedAction, setFocusedAction] = useState('');
  const [isPanicLoading, setIsPanicLoading] = useState(false);

  // States for Escape Hatch
  const [escapeHatchLoadingTaskId, setEscapeHatchLoadingTaskId] = useState<string | null>(null);
  const [isEscapeModalOpen, setIsEscapeModalOpen] = useState(false);
  const [escapeDraftText, setEscapeDraftText] = useState('');
  const [copyButtonText, setCopyButtonText] = useState('Copy to clipboard');

  // States for Renegotiation Agent
  const [isRenegotiateLoading, setIsRenegotiateLoading] = useState(false);
  const [isRenegotiateModalOpen, setIsRenegotiateModalOpen] = useState(false);
  const [renegotiatePlan, setRenegotiatePlan] = useState<{
    protect: Array<{ title: string; reason: string }>;
    extend: Array<{ title: string; reason: string; draft: string }>;
    drop: Array<{ title: string; reason: string; draft: string }>;
  } | null>(null);
  const [copiedDrafts, setCopiedDrafts] = useState<Record<string, boolean>>({});

  const handleRenegotiate = async () => {
    if (tasks.length === 0) {
      alert("No tasks to renegotiate — you're all clear!");
      return;
    }
    setIsRenegotiateLoading(true);
    try {
      const taskList = tasks.map(t => ({
        title: t.title,
        urgency: t.urgency,
        deadline: t.pillText || 'No deadline set',
        context: t.context || ''
      }));

      const response = await fetchWithTimeout(
        '/api/renegotiate',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tasks: taskList }),
        },
        10000
      );

      if (!response.ok) {
        throw new Error('Renegotiate response not OK');
      }

      const data = await response.json();
      if (data && (Array.isArray(data.protect) || Array.isArray(data.extend) || Array.isArray(data.drop))) {
        setRenegotiatePlan({
          protect: data.protect || [],
          extend: data.extend || [],
          drop: data.drop || []
        });
        setIsRenegotiateModalOpen(true);
      } else {
        throw new Error('Invalid renegotiation response structure');
      }
    } catch (error) {
      console.warn('Renegotiation API failed, using fallback:', error);
      
      const protect: any[] = [];
      const extend: any[] = [];
      const drop: any[] = [];

      const highUrgencyTask = tasks.find(t => t.urgency === 'high');
      const mediumUrgencyTask = tasks.find(t => t.urgency === 'medium');

      tasks.forEach(t => {
        if (highUrgencyTask && t.id === highUrgencyTask.id) {
          protect.push({
            title: t.title,
            reason: "Highest urgency — cannot be deferred"
          });
        } else if (mediumUrgencyTask && t.id === mediumUrgencyTask.id) {
          extend.push({
            title: t.title,
            reason: "Important but has some flexibility",
            draft: `Hi, I wanted to reach out about ${t.title}. I'm currently at capacity with some urgent matters. Would it be possible to get a short extension? I can have this completed within the next few days. Thank you for understanding.`
          });
        } else {
          drop.push({
            title: t.title,
            reason: "Lower priority — can be safely deferred",
            draft: `Hi, I need to be upfront — I won't be able to get to ${t.title} right now. I'll revisit this when my current workload clears. Apologies for any inconvenience.`
          });
        }
      });

      setRenegotiatePlan({ protect, extend, drop });
      setIsRenegotiateModalOpen(true);
    } finally {
      setIsRenegotiateLoading(false);
    }
  };

  const copyDraftToClipboard = (taskTitle: string, draftText: string) => {
    navigator.clipboard.writeText(draftText);
    setCopiedDrafts(prev => ({ ...prev, [taskTitle]: true }));
    setTimeout(() => {
      setCopiedDrafts(prev => ({ ...prev, [taskTitle]: false }));
    }, 2000);
  };

  const handlePanic = async () => {
    if (tasks.length === 0) return;
    setIsPanicLoading(true);
    try {
      const taskList = tasks.map(t => ({
        title: t.title,
        urgency: t.urgency,
        deadline: t.pillText
      }));

      const response = await fetchWithTimeout(
        '/api/panic',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tasks: taskList }),
        },
        10000
      );

      if (!response.ok) {
        throw new Error('Panic response not OK');
      }

      const data = await response.json();
      if (data && data.taskTitle) {
        setIsFocusMode(true);
        setFocusedTaskTitle(data.taskTitle);
        setFocusedReason(data.reason || 'Highest priority task');
        setFocusedAction(data.action || 'Focus on this right now');
      } else {
        throw new Error('Invalid panic data');
      }
    } catch (error) {
      console.warn('Panic API failed, falling back locally:', error);
      let fallbackTask = tasks.find(t => t.urgency === 'high') || tasks[0];
      if (fallbackTask) {
        setIsFocusMode(true);
        setFocusedTaskTitle(fallbackTask.title);
        setFocusedReason('Highest urgency task');
        setFocusedAction('Start working on this immediately.');
      }
    } finally {
      setIsPanicLoading(false);
    }
  };

  const handleEscapeHatch = async (task: Task) => {
    setEscapeHatchLoadingTaskId(task.id);
    try {
      const response = await fetchWithTimeout(
        '/api/escape-hatch',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ taskTitle: task.title, taskContext: task.context }),
        },
        10000
      );

      if (!response.ok) {
        throw new Error('Escape hatch response not OK');
      }

      const data = await response.json();
      if (data && typeof data.draft === 'string') {
        setEscapeDraftText(data.draft);
        setIsEscapeModalOpen(true);
      } else {
        throw new Error('Invalid escape hatch data');
      }
    } catch (error) {
      console.warn('Escape hatch API failed, falling back locally:', error);
      setEscapeDraftText(
        "Hi, I sincerely apologize for the delay on this. I got caught up with some urgent matters and lost track of time. I'll have this to you by tomorrow — thank you so much for your patience."
      );
      setIsEscapeModalOpen(true);
    } finally {
      setEscapeHatchLoadingTaskId(null);
    }
  };

  const handleDecomposeTask = async (task: Task) => {
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, decomposing: true } : t));
    try {
      const response = await fetchWithTimeout(
        '/api/decompose',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ taskTitle: task.title, taskContext: task.context }),
        },
        10000
      );

      if (!response.ok) {
        throw new Error('Decompose response not OK');
      }

      const data = await response.json();
      if (data && Array.isArray(data.subtasks)) {
        const subtasksWithCompleted = data.subtasks.map((st: any) => ({
          step: st.step,
          minutes: st.minutes,
          completed: false
        }));
        setTasks(prev => prev.map(t => t.id === task.id ? {
          ...t,
          subtasks: subtasksWithCompleted,
          decomposed: true,
          decomposing: false,
          subtasksCollapsed: false
        } : t));
      } else {
        throw new Error('Invalid subtasks format');
      }
    } catch (err) {
      console.warn('Decomposition API failed, using fallback:', err);
      const fallbackSubtasks = [
        { step: "Review what needs to be done", minutes: 10, completed: false },
        { step: "Gather required materials", minutes: 15, completed: false },
        { step: "Complete the main work", minutes: 45, completed: false },
        { step: "Review and check for errors", minutes: 15, completed: false },
        { step: "Submit or deliver the result", minutes: 5, completed: false }
      ];
      setTasks(prev => prev.map(t => t.id === task.id ? {
        ...t,
        subtasks: fallbackSubtasks,
        decomposed: true,
        decomposing: false,
        subtasksCollapsed: false
      } : t));
    }
  };

  const toggleSubtask = (taskId: string, subtaskIndex: number) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId || !t.subtasks) return t;
      const updatedSubtasks = t.subtasks.map((st, idx) => 
        idx === subtaskIndex ? { ...st, completed: !st.completed } : st
      );
      return { ...t, subtasks: updatedSubtasks };
    }));
  };

  const toggleSubtasksCollapse = (taskId: string) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, subtasksCollapsed: !t.subtasksCollapsed } : t
    ));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeTick((prev) => prev + 1);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Helper to parse deadline string into Date
  const parseDeadline = (pillText: string, taskId?: string): Date | null => {
    if (taskId === 'task-1') {
      const d = new Date();
      d.setHours(23, 59, 0, 0);
      return d;
    }
    if (taskId === 'task-2') {
      const d = new Date();
      d.setDate(d.getDate() - 2);
      d.setHours(23, 59, 0, 0);
      return d;
    }
    if (taskId === 'task-3') {
      const d = new Date();
      d.setDate(d.getDate() + 2);
      d.setHours(23, 59, 0, 0);
      return d;
    }
    if (taskId === 'task-4') {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      d.setHours(23, 59, 0, 0);
      return d;
    }

    if (!pillText || pillText === 'No deadline set' || pillText === 'No deadline mentioned') {
      return null;
    }

    const lower = pillText.toLowerCase();
    const now = new Date();

    if (lower.includes('today')) {
      const d = new Date();
      d.setHours(23, 59, 0, 0);
      return d;
    }
    if (lower.includes('tomorrow')) {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(23, 59, 0, 0);
      return d;
    }

    // Try parsing weekday names
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    for (let i = 0; i < 7; i++) {
      if (lower.includes(daysOfWeek[i])) {
        const d = new Date();
        const currentDay = d.getDay();
        const targetDay = i;
        let diff = targetDay - currentDay;
        if (diff <= 0) diff += 7;
        d.setDate(d.getDate() + diff);

        if (lower.includes('4:00 pm') || lower.includes('4 pm')) {
          d.setHours(16, 0, 0, 0);
        } else {
          d.setHours(23, 59, 0, 0);
        }
        return d;
      }
    }

    // Check if there is a day of month number (e.g. "27th")
    const match = lower.match(/\b(\d+)(st|nd|rd|th)?\b/);
    if (match) {
      const dayNum = parseInt(match[1], 10);
      if (dayNum >= 1 && dayNum <= 31) {
        const d = new Date();
        d.setDate(dayNum);
        d.setHours(23, 59, 0, 0);
        return d;
      }
    }

    return null;
  };

  const getTaskDurationMinutes = (title: string): number => {
    const lower = title.toLowerCase();
    if (/\b(pay|bill|payment|submit|form|confirm)\b/.test(lower)) {
      return 20;
    }
    if (/\b(email|reply|message|send|draft)\b/.test(lower)) {
      return 45;
    }
    if (/\b(letter|write|report|essay|proposal)\b/.test(lower)) {
      return 120;
    }
    if (/\b(meeting|call|sync|attend)\b/.test(lower)) {
      return 60;
    }
    return 30;
  };

  const getTaskBaseTime = (task: Task, deadline: Date): Date => {
    if ((task as any).createdAt) {
      return new Date((task as any).createdAt);
    }
    return new Date(deadline.getTime() - 24 * 60 * 60 * 1000);
  };

  const getCalendarCells = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();
    
    const cells: { date: Date; isCurrentMonth: boolean }[] = [];
    
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      cells.push({
        date: new Date(year, month - 1, prevMonthTotalDays - i),
        isCurrentMonth: false
      });
    }
    
    for (let i = 1; i <= totalDays; i++) {
      cells.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      cells.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }
    
    return cells;
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => {
      const deadline = parseDeadline(task.pillText, task.id);
      if (!deadline) return false;
      return (
        deadline.getFullYear() === date.getFullYear() &&
        deadline.getMonth() === date.getMonth() &&
        deadline.getDate() === date.getDate()
      );
    });
  };

  // Email States
  const [emails, setEmails] = useState<Email[]>(INITIAL_EMAILS);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);

  // Scan States
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    status: 'success' | 'none' | 'error' | null;
    count?: number;
  }>({ status: null });

  const fetchWithTimeout = (url: string, options: any, timeoutMs: number) => {
    return new Promise<Response>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error("Timeout"));
      }, timeoutMs);

      fetch(url, options)
        .then((response) => {
          clearTimeout(timer);
          resolve(response);
        })
        .catch((err) => {
          clearTimeout(timer);
          reject(err);
        });
    });
  };

  const handleScanForDeadlines = async () => {
    if (!currentEmail) return;
    setIsScanning(true);
    setScanResult({ status: null });

    try {
      const response = await fetchWithTimeout(
        '/api/scan-email',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ bodyText: currentEmail.body }),
        },
        10000 // 10 seconds timeout
      );

      if (!response.ok) {
        throw new Error('Response not OK');
      }

      const data: any = await response.json();
      if (!data || typeof data.result !== 'string') {
        throw new Error('Invalid response structure');
      }

      // Stripping markdown code block fences if present
      let rawResult = data.result.trim();
      if (rawResult.startsWith('```json')) {
        rawResult = rawResult.substring(7);
      } else if (rawResult.startsWith('```')) {
        rawResult = rawResult.substring(3);
      }
      if (rawResult.endsWith('```')) {
        rawResult = rawResult.substring(0, rawResult.length - 3);
      }
      rawResult = rawResult.trim();

      const parsed = JSON.parse(rawResult);

      if (!Array.isArray(parsed)) {
        throw new Error('Response is not an array');
      }

      // Validation
      const validatedTasks: any[] = [];
      for (const item of parsed) {
        if (typeof item === 'object' && item !== null && typeof item.title === 'string') {
          const title = item.title;
          const deadline = typeof item.deadline === 'string' ? item.deadline : 'No deadline mentioned';
          let urgency: 'high' | 'medium' | 'low' = 'low';
          if (item.urgency === 'high' || item.urgency === 'medium' || item.urgency === 'low') {
            urgency = item.urgency;
          }
          validatedTasks.push({ title, deadline, urgency });
        }
      }

      if (validatedTasks.length === 0) {
        setScanResult({ status: 'none' });
      } else {
        // Add each validated task to the Tasks list
        const newTasks: Task[] = validatedTasks.map((t, idx) => ({
          id: `task-scanned-${Date.now()}-${idx}`,
          title: t.title,
          pillText: t.deadline,
          urgency: t.urgency,
          context: `Found in your inbox — ${currentEmail.from}`,
          primaryAction: 'Handle it now',
          secondaryAction: 'Snooze',
          createdAt: Date.now(),
          subtasks: [],
          decomposing: false,
          decomposed: false,
          subtasksCollapsed: false
        }));

        setTasks((prevTasks) => [...prevTasks, ...newTasks]);
        setScanResult({ status: 'success', count: validatedTasks.length });
        setScannedCount((prev) => prev + validatedTasks.length);
      }
    } catch (error) {
      console.error('Scan error:', error);
      setScanResult({ status: 'error' });
    } finally {
      setIsScanning(false);
    }
  };

  const handleAddTask = (e: FormEvent) => {
    e.preventDefault();
    const trimmedTitle = newTaskTitle.trim();
    if (!trimmedTitle) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: trimmedTitle,
      pillText: 'No deadline set',
      urgency: 'low',
      context: 'Newly added. Details can be set later.',
      primaryAction: 'Handle it now',
      secondaryAction: 'Snooze',
      createdAt: Date.now(),
      subtasks: [],
      decomposing: false,
      decomposed: false,
      subtasksCollapsed: false
    };

    setTasks((prevTasks) => [...prevTasks, newTask]);
    setNewTaskTitle('');
  };

  const handleRemoveTask = (taskId: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    setCompletedCount((prev) => prev + 1);
  };

  const handleOpenEmail = (emailId: string) => {
    setSelectedEmailId(emailId);
    setScanResult({ status: null });
    setIsScanning(false);
    setEmails((prevEmails) =>
      prevEmails.map((email) =>
        email.id === emailId ? { ...email, unread: false } : email
      )
    );
  };

  const toggleStar = (emailId: string, e: MouseEvent) => {
    e.stopPropagation();
    setEmails((prevEmails) =>
      prevEmails.map((email) =>
        email.id === emailId ? { ...email, starred: !email.starred } : email
      )
    );
  };

  const toggleImportant = (emailId: string, e: MouseEvent) => {
    e.stopPropagation();
    setEmails((prevEmails) =>
      prevEmails.map((email) =>
        email.id === emailId ? { ...email, important: !email.important } : email
      )
    );
  };

  const isInbox = activeTab === 'inbox';
  const currentEmail = emails.find((e) => e.id === selectedEmailId);

  return (
    <div
      id="polaris-root"
      className={`min-h-screen w-full flex flex-col font-sans antialiased transition-colors duration-200 ${
        isInbox ? 'bg-white' : 'bg-polaris-bg'
      }`}
    >
      {/* Brand Top Bar */}
      <header
        id="polaris-header"
        className="w-full border-b border-polaris-border py-6 px-8 md:px-16 flex flex-col sm:flex-row sm:items-baseline sm:gap-4 bg-polaris-bg"
      >
        <h1 id="polaris-logo" className="font-serif font-medium text-[24px] text-polaris-primary leading-none">
          Polaris
        </h1>
        <p id="polaris-tagline" className="font-sans font-normal text-[13px] text-polaris-secondary mt-1.5 sm:mt-0">
          Your fixed point before the deadline.
        </p>
      </header>

      {/* Clean Tab Navigation */}
      <nav
        id="polaris-tabs"
        className="w-full border-b border-polaris-border px-8 md:px-16 flex bg-polaris-bg"
      >
        <button
          id="tab-tasks"
          type="button"
          onClick={() => {
            setActiveTab('tasks');
          }}
          className={`py-3.5 px-4 font-sans font-medium text-[14px] border-b-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-polaris-primary/30 ${
            activeTab === 'tasks'
              ? 'border-polaris-primary text-polaris-primary'
              : 'border-transparent text-polaris-secondary hover:text-polaris-primary'
          }`}
        >
          Tasks
        </button>
        <button
          id="tab-calendar"
          type="button"
          onClick={() => {
            setActiveTab('calendar');
          }}
          className={`py-3.5 px-4 font-sans font-medium text-[14px] border-b-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-polaris-primary/30 ${
            activeTab === 'calendar'
              ? 'border-polaris-primary text-polaris-primary'
              : 'border-transparent text-polaris-secondary hover:text-polaris-primary'
          }`}
        >
          Calendar
        </button>
        <button
          id="tab-dashboard"
          type="button"
          onClick={() => {
            setActiveTab('dashboard');
          }}
          className={`py-3.5 px-4 font-sans font-medium text-[14px] border-b-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-polaris-primary/30 ${
            activeTab === 'dashboard'
              ? 'border-polaris-primary text-polaris-primary'
              : 'border-transparent text-polaris-secondary hover:text-polaris-primary'
          }`}
        >
          Dashboard
        </button>
        <button
          id="tab-inbox"
          type="button"
          onClick={() => {
            setActiveTab('inbox');
          }}
          className={`py-3.5 px-4 font-sans font-medium text-[14px] border-b-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-polaris-primary/30 ${
            activeTab === 'inbox'
              ? 'border-polaris-primary text-polaris-primary'
              : 'border-transparent text-polaris-secondary hover:text-polaris-primary'
          }`}
        >
          Inbox
        </button>
      </nav>

      {/* Main Content Area */}
      <main
        id="polaris-content"
        className={`flex-1 flex flex-col items-center ${
          activeTab === 'inbox' ? 'w-full pt-0 pb-0 px-0' : 'pt-10 pb-16 px-6'
        }`}
      >
        {activeTab === 'tasks' && (
          /* TASKS TAB PANEL */
          <div id="polaris-tasks-container" className="w-full max-w-[640px] flex flex-col gap-4">
            {/* Panic Button Bar */}
            <div 
              className="w-full bg-[#B23A2E] rounded-[12px] p-[14px] px-5 flex items-center justify-between transition-all duration-200 hover:bg-[#9e2f24] mb-2"
            >
              <div className="flex items-center gap-2 text-white">
                <span className="text-[18px]">⚡</span>
                <span className="font-sans font-medium text-[15px]">
                  {isFocusMode 
                    ? `Focus mode active — seeing 1 of ${tasks.length} tasks` 
                    : "I'm overwhelmed — what do I do RIGHT NOW?"}
                </span>
              </div>
              <button
                type="button"
                onClick={handlePanic}
                disabled={isPanicLoading}
                className="bg-white text-[#B23A2E] font-sans font-medium text-[13px] rounded-[8px] px-4 py-2 hover:bg-opacity-90 active:scale-98 transition-all cursor-pointer disabled:opacity-85"
              >
                {isPanicLoading ? "Thinking..." : "Focus me"}
              </button>
            </div>

            {/* Focus Mode Banner */}
            {isFocusMode && (
              <div className="w-full bg-white border-l-4 border-[#B23A2E] rounded-[8px] p-4 mb-3 shadow-sm flex flex-col gap-2">
                <div className="font-sans font-medium text-[14px] text-[#B23A2E] flex items-center gap-1.5">
                  <span>⚡ Focus mode</span>
                </div>
                <div className="font-sans text-[14px] text-[#0E1B2A] leading-relaxed">
                  {focusedReason}
                </div>
                <div className="font-sans font-medium text-[14px] text-[#C8893B] leading-relaxed">
                  → {focusedAction}
                </div>
              </div>
            )}

            {/* Renegotiation Agent Button */}
            <button
              id="renegotiate-btn"
              type="button"
              onClick={handleRenegotiate}
              disabled={isRenegotiateLoading}
              className="w-full rounded-[12px] py-3 px-5 bg-transparent border-[1.5px] border-[rgba(14,27,42,0.15)] text-[#5B6B7B] font-sans font-medium text-[14px] hover:bg-[rgba(14,27,42,0.04)] hover:border-[rgba(14,27,42,0.3)] hover:text-[#0E1B2A] transition-all disabled:opacity-80 cursor-pointer"
            >
              {isRenegotiateLoading ? "Analyzing your tasks..." : "🏳 I can't do all of this — help me decide"}
            </button>

            {/* Add Task Input Row */}
            <form id="polaris-add-form" onSubmit={handleAddTask} className="w-full flex gap-3 mb-6">
              <input
                id="polaris-task-input"
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Add a new task…"
                className="flex-1 bg-white border border-polaris-border rounded-[10px] px-4 py-3 font-sans text-[14px] text-polaris-primary placeholder-polaris-secondary/60 focus:outline-none focus:border-polaris-primary/30 transition-all"
              />
              <button
                id="polaris-add-button"
                type="submit"
                className="px-5 py-3 bg-polaris-primary text-[#F7F5F0] font-sans font-medium text-[14px] rounded-[8px] hover:bg-opacity-90 active:scale-98 transition-all cursor-pointer whitespace-nowrap"
              >
                Add task
              </button>
            </form>

            {/* Task List */}
            <div id="polaris-tasks-list" className="flex flex-col gap-4">
              {tasks
                .filter((task) => !isFocusMode || task.title === focusedTaskTitle)
                .map((task) => {
                  let pillClass = '';
                  if (task.urgency === 'high') {
                    pillClass = 'bg-[rgba(178,58,46,0.12)] text-[#B23A2E]';
                  } else if (task.urgency === 'medium') {
                    pillClass = 'bg-[rgba(200,137,59,0.14)] text-[#8A6225]';
                  } else {
                    pillClass = 'bg-[rgba(91,107,123,0.12)] text-[#5B6B7B]';
                  }
                  
                  const allStepsCompleted = !!(task.decomposed && task.subtasks && task.subtasks.length > 0 && task.subtasks.every(st => st.completed));

                  return (
                    <div
                      key={task.id}
                      id={`task-card-${task.id}`}
                      className="bg-white border border-polaris-border rounded-[14px] p-[18px] flex flex-col items-start transition-all w-full"
                      style={allStepsCompleted ? { boxShadow: '0 0 0 2px rgba(15,157,88,0.3)', borderColor: 'rgba(15,157,88,0.4)' } : undefined}
                    >
                      {/* Top Row: Urgency Pill + Done button */}
                      <div className="w-full flex justify-between items-center mb-3">
                        <div className={`px-2.5 py-1 rounded-[6px] text-[12px] font-medium leading-none ${pillClass}`}>
                          {task.pillText}
                        </div>
                        <button
                          id={`done-btn-${task.id}`}
                          type="button"
                          onClick={() => handleRemoveTask(task.id)}
                          style={allStepsCompleted ? { color: '#0F9D58' } : undefined}
                          className="flex items-center gap-1.5 px-[10px] py-[6px] rounded-[8px] bg-transparent text-polaris-secondary hover:bg-[rgba(91,107,123,0.10)] hover:text-polaris-primary font-sans font-medium text-[13px] transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-polaris-primary/30"
                        >
                          <Check size={14} strokeWidth={2} className="shrink-0" />
                          <span>Done</span>
                        </button>
                      </div>

                      {/* Task Title */}
                      <h2 className="font-serif font-medium text-[18px] text-polaris-primary mb-1.5 leading-snug">
                        {task.title}
                      </h2>

                      {/* Context */}
                      <p className="font-sans font-normal text-[14px] text-polaris-secondary mb-[18px] leading-relaxed">
                        {task.context}
                      </p>

                      {/* Subtasks Divider & Checklist */}
                      {task.decomposed && task.subtasks && task.subtasks.length > 0 && (
                        <div className="w-full border-t border-[rgba(14,27,42,0.08)] pt-3.5 mb-[18px]">
                          {/* Header Row */}
                          <div 
                            onClick={() => toggleSubtasksCollapse(task.id)}
                            className="flex items-center justify-between cursor-pointer select-none mb-2"
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-[#5B6B7B] w-3 text-center">
                                {task.subtasksCollapsed ? '▶' : '▼'}
                              </span>
                              <span className="font-sans font-medium text-[12px] text-[#5B6B7B] uppercase tracking-[0.05em]">
                                Subtasks
                              </span>
                            </div>
                            <span className="font-sans text-[12px] text-[#5B6B7B]">
                              ({task.subtasks.reduce((sum, st) => sum + st.minutes, 0)} min total)
                            </span>
                          </div>

                          {/* Subtask Rows Container */}
                          <div 
                            className="overflow-hidden transition-all duration-300"
                            style={{
                              height: task.subtasksCollapsed ? '0px' : 'auto',
                              opacity: task.subtasksCollapsed ? 0 : 1,
                            }}
                          >
                            <div className="flex flex-col">
                              {task.subtasks.map((sub, idx) => (
                                <div 
                                  key={idx} 
                                  onClick={() => toggleSubtask(task.id, idx)}
                                  className="py-1.5 flex items-center gap-2.5 cursor-pointer select-none"
                                >
                                  {/* Custom Checkbox */}
                                  <div 
                                    className={`w-4 h-4 rounded-[4px] border border-[rgba(14,27,42,0.2)] flex items-center justify-center transition-all shrink-0 ${
                                      sub.completed ? 'bg-[#0E1B2A] border-[#0E1B2A]' : 'bg-white'
                                    }`}
                                    style={{ borderWidth: '1.5px' }}
                                  >
                                    {sub.completed && (
                                      <span className="text-white text-[10px] font-bold select-none leading-none">✓</span>
                                    )}
                                  </div>

                                  {/* Step text */}
                                  <span 
                                    className={`font-sans text-[13px] transition-all truncate ${
                                      sub.completed ? 'text-[#5B6B7B] line-through' : 'text-[#0E1B2A]'
                                    }`}
                                  >
                                    {sub.step}
                                  </span>

                                  {/* Time estimate */}
                                  <span className={`font-sans text-[12px] text-[#5B6B7B] ml-auto shrink-0`}>
                                    {sub.minutes}m
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* All steps done Banner */}
                          {task.subtasks.every(st => st.completed) && (
                            <div className="w-full bg-[rgba(15,157,88,0.08)] rounded-[6px] p-2.5 px-3 mt-3 text-[13px] font-sans font-normal text-[#0F9D58] flex items-center gap-1.5">
                              <span>✓ All steps done — ready to mark complete?</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Urgency/Countdown Bar */}
                      {(() => {
                        const dl = parseDeadline(task.pillText, task.id);
                        if (!dl) return null;
                        
                        const duration = getTaskDurationMinutes(task.title);
                        const ponr = new Date(dl.getTime() - duration * 60 * 1000);
                        const now = new Date();
                        
                        let percent = 0;
                        let barColor = '#0F9D58';
                        let textColorClass = 'text-[#0F9D58]';
                        let countdownText = '';
                        
                        const totalWindow = dl.getTime() - getTaskBaseTime(task, dl).getTime();
                        const remaining = ponr.getTime() - now.getTime();
                        
                        if (remaining <= 0) {
                          percent = 0;
                          barColor = '#B23A2E';
                          textColorClass = 'text-[#B23A2E]';
                          countdownText = '🔴 Point of no return passed — act now.';
                        } else {
                          percent = Math.max(0, Math.min(100, (remaining / totalWindow) * 100));
                          if (percent > 50) {
                            barColor = '#0F9D58';
                            textColorClass = 'text-[#0F9D58]';
                          } else if (percent >= 25) {
                            barColor = '#C8893B';
                            textColorClass = 'text-[#C8893B]';
                          } else {
                            barColor = '#B23A2E';
                            textColorClass = 'text-[#B23A2E]';
                          }
                          
                          const timeString = ponr.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                          const isTodayVal = ponr.toDateString() === now.toDateString();
                          const tomorrow = new Date(now);
                          tomorrow.setDate(tomorrow.getDate() + 1);
                          const isTomorrowVal = ponr.toDateString() === tomorrow.toDateString();
                          
                          let dayString = '';
                          if (isTodayVal) {
                            dayString = 'today';
                          } else if (isTomorrowVal) {
                            dayString = 'tomorrow';
                          } else {
                            dayString = ponr.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
                          }
                          
                          countdownText = `⚠ Start by ${dayString} at ${timeString} or you'll miss this.`;
                        }
                        
                        return (
                          <div className="w-full mb-[18px]">
                            <div className="w-full bg-[rgba(14,27,42,0.08)] h-[3px] rounded-[2px] overflow-hidden">
                              <div 
                                className="h-full rounded-[2px] transition-all duration-500" 
                                style={{ width: `${percent}%`, backgroundColor: barColor }}
                              />
                            </div>
                            <div className={`mt-1.5 font-sans font-normal text-[12px] ${textColorClass}`}>
                              {countdownText}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Buttons */}
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            if (task.primaryAction === 'Draft a reply') {
                              handleEscapeHatch(task);
                            } else if (task.primaryAction === 'Break it down') {
                              handleDecomposeTask(task);
                            }
                          }}
                          disabled={
                            (task.primaryAction === 'Draft a reply' && escapeHatchLoadingTaskId === task.id) ||
                            (task.primaryAction === 'Break it down' && task.decomposing)
                          }
                          className="px-4 py-[9px] bg-polaris-primary text-[#F7F5F0] font-sans font-medium text-[13px] rounded-[8px] hover:bg-opacity-90 active:scale-98 transition-all cursor-pointer disabled:opacity-80"
                        >
                          {task.primaryAction === 'Draft a reply' && escapeHatchLoadingTaskId === task.id 
                            ? 'Drafting...' 
                            : task.primaryAction === 'Break it down' && task.decomposing 
                            ? 'Breaking down...' 
                            : task.primaryAction}
                        </button>
                        <button
                          type="button"
                          className="px-4 py-[9px] bg-transparent text-polaris-primary border border-[rgba(14,27,42,0.2)] font-sans font-medium text-[13px] rounded-[8px] hover:bg-[rgba(14,27,42,0.03)] active:scale-98 transition-all cursor-pointer"
                        >
                          {task.secondaryAction}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>

            {isFocusMode && (
              <div className="text-center mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsFocusMode(false);
                    setFocusedTaskTitle('');
                  }}
                  className="font-sans text-[13px] text-[#5B6B7B] hover:text-polaris-primary hover:underline bg-transparent border-0 cursor-pointer focus:outline-none"
                >
                  Show all tasks
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'calendar' && (
          /* CALENDAR TAB PANEL */
          <div id="polaris-calendar-container" className="w-full max-w-[800px] flex flex-col gap-6 pt-10 pb-16 px-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-medium text-[20px] text-polaris-primary">Calendar View</h2>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    const nextMonth = new Date(currentCalendarMonth);
                    nextMonth.setMonth(nextMonth.getMonth() - 1);
                    setCurrentCalendarMonth(nextMonth);
                    setSelectedCalendarDate(null);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[rgba(14,27,42,0.05)] cursor-pointer text-polaris-primary font-bold text-[18px] border-0 bg-transparent"
                >
                  ‹
                </button>
                <span className="font-sans font-medium text-[16px] text-polaris-primary min-w-[120px] text-center">
                  {currentCalendarMonth.toLocaleDateString([], { month: 'long', year: 'numeric' })}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const nextMonth = new Date(currentCalendarMonth);
                    nextMonth.setMonth(nextMonth.getMonth() + 1);
                    setCurrentCalendarMonth(nextMonth);
                    setSelectedCalendarDate(null);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[rgba(14,27,42,0.05)] cursor-pointer text-polaris-primary font-bold text-[18px] border-0 bg-transparent"
                >
                  ›
                </button>
              </div>
            </div>

            <div className="bg-white border border-polaris-border rounded-[14px] p-6 shadow-sm relative">
              <div className="grid grid-cols-7 gap-2 mb-4 text-center">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="font-sans font-medium text-[13px] text-[#5B6B7B] py-1">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {getCalendarCells(currentCalendarMonth).map((cell, idx) => {
                  const dayTasks = getTasksForDate(cell.date);
                  const isToday = cell.date.toDateString() === new Date().toDateString();
                  
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (dayTasks.length > 0) {
                          setSelectedCalendarDate(cell.date);
                        } else {
                          setSelectedCalendarDate(null);
                        }
                      }}
                      className={`min-h-[90px] border border-[rgba(14,27,42,0.04)] rounded-[8px] p-2 flex flex-col items-start justify-between cursor-pointer transition-all duration-150 ${
                        cell.isCurrentMonth ? 'bg-white' : 'bg-transparent text-[#C4C4C4]'
                      } ${dayTasks.length > 0 ? 'hover:border-polaris-primary/20 hover:shadow-sm' : ''}`}
                    >
                      <div className="w-full flex items-start justify-between">
                        {isToday ? (
                          <div className="w-6 h-6 rounded-full bg-[#0E1B2A] text-white flex items-center justify-center font-sans font-medium text-[13px]">
                            {cell.date.getDate()}
                          </div>
                        ) : (
                          <span className={`font-sans font-medium text-[13px] ${cell.isCurrentMonth ? 'text-polaris-primary' : 'text-[#C4C4C4]'}`}>
                            {cell.date.getDate()}
                          </span>
                        )}
                      </div>

                      <div className="w-full flex flex-col gap-1 mt-2 overflow-hidden">
                        {dayTasks.slice(0, 2).map((task) => {
                          let dotColor = '#5B6B7B';
                          if (task.urgency === 'high') dotColor = '#B23A2E';
                          else if (task.urgency === 'medium') dotColor = '#C8893B';
                          
                          return (
                            <div key={task.id} className="flex items-center gap-1.5 w-full">
                              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
                              <span className="font-sans font-normal text-[11px] text-polaris-primary truncate leading-none">
                                {task.title}
                              </span>
                            </div>
                          );
                        })}
                        {dayTasks.length > 2 && (
                          <div className="font-sans font-normal text-[10px] text-polaris-secondary pl-3">
                            +{dayTasks.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedCalendarDate && (
                <div 
                  className="absolute z-10 bg-white border border-polaris-border rounded-[12px] p-4 shadow-lg max-w-[280px] w-full"
                  style={{
                    bottom: '24px',
                    right: '24px',
                  }}
                >
                  <div className="flex items-center justify-between mb-3 border-b border-[rgba(14,27,42,0.06)] pb-1.5">
                    <span className="font-sans font-bold text-[13px] text-polaris-primary">
                      {selectedCalendarDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCalendarDate(null);
                      }}
                      className="text-polaris-secondary hover:text-polaris-primary text-[14px] border-0 bg-transparent cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto">
                    {getTasksForDate(selectedCalendarDate).map((task) => {
                      let pillClass = 'bg-[rgba(91,107,123,0.12)] text-[#5B6B7B]';
                      if (task.urgency === 'high') pillClass = 'bg-[rgba(178,58,46,0.12)] text-[#B23A2E]';
                      else if (task.urgency === 'medium') pillClass = 'bg-[rgba(200,137,59,0.14)] text-[#8A6225]';
                      
                      return (
                        <div key={task.id} className="flex flex-col gap-0.5">
                          <span className="font-sans font-medium text-[13px] text-polaris-primary leading-tight">
                            {task.title}
                          </span>
                          <span className={`self-start px-1.5 py-0.5 rounded-[4px] text-[10px] font-medium ${pillClass}`}>
                            {task.urgency}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          /* DASHBOARD TAB PANEL */
          <div id="polaris-dashboard-container" className="w-full max-w-[900px] flex flex-col gap-6 pt-10 pb-16 px-6">
            <h2 className="font-serif font-medium text-[20px] text-polaris-primary mb-2">Dashboard</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {/* CARD 1: Task Overview */}
              <div className="bg-white border border-polaris-border rounded-[14px] p-6 shadow-sm">
                <h3 className="font-serif font-medium text-[16px] text-[#0E1B2A] mb-4">Task Overview</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="font-sans font-medium text-[32px] text-[#0E1B2A] leading-none">
                      {tasks.length}
                    </span>
                    <span className="font-sans text-[12px] text-polaris-secondary mt-1">Total tasks</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-sans font-medium text-[32px] text-[#0E1B2A] leading-none">
                      {tasks.filter(t => t.urgency === 'high').length}
                    </span>
                    <span className="font-sans text-[12px] text-polaris-secondary mt-1">High urgency</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-sans font-medium text-[32px] text-[#0E1B2A] leading-none">
                      {tasks.filter(t => {
                        const dl = parseDeadline(t.pillText, t.id);
                        if (!dl) return false;
                        return dl.toDateString() === new Date().toDateString();
                      }).length}
                    </span>
                    <span className="font-sans text-[12px] text-polaris-secondary mt-1">Due today</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-sans font-medium text-[32px] text-[#0E1B2A] leading-none">
                      {completedCount}
                    </span>
                    <span className="font-sans text-[12px] text-polaris-secondary mt-1">Completed</span>
                  </div>
                </div>
              </div>

              {/* CARD 2: Urgency Breakdown */}
              <div className="bg-white border border-polaris-border rounded-[14px] p-6 shadow-sm">
                <h3 className="font-serif font-medium text-[16px] text-[#0E1B2A] mb-4">Urgency Breakdown</h3>
                <div className="flex flex-col gap-4">
                  {/* High Urgency */}
                  {(() => {
                    const highCount = tasks.filter(t => t.urgency === 'high').length;
                    const pct = tasks.length > 0 ? (highCount / tasks.length) * 100 : 0;
                    return (
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-sans text-[13px] text-polaris-primary w-16 shrink-0 font-medium">High</span>
                        <div className="flex-1 bg-[rgba(14,27,42,0.05)] h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-[#B23A2E] h-full rounded-full transition-all duration-1000 ease-out" 
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="font-sans font-bold text-[13px] text-polaris-primary w-6 text-right shrink-0">{highCount}</span>
                      </div>
                    );
                  })()}

                  {/* Medium Urgency */}
                  {(() => {
                    const medCount = tasks.filter(t => t.urgency === 'medium').length;
                    const pct = tasks.length > 0 ? (medCount / tasks.length) * 100 : 0;
                    return (
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-sans text-[13px] text-polaris-primary w-16 shrink-0 font-medium">Medium</span>
                        <div className="flex-1 bg-[rgba(14,27,42,0.05)] h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-[#C8893B] h-full rounded-full transition-all duration-1000 ease-out" 
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="font-sans font-bold text-[13px] text-polaris-primary w-6 text-right shrink-0">{medCount}</span>
                      </div>
                    );
                  })()}

                  {/* Low Urgency */}
                  {(() => {
                    const lowCount = tasks.filter(t => t.urgency === 'low').length;
                    const pct = tasks.length > 0 ? (lowCount / tasks.length) * 100 : 0;
                    return (
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-sans text-[13px] text-polaris-primary w-16 shrink-0 font-medium">Low</span>
                        <div className="flex-1 bg-[rgba(14,27,42,0.05)] h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-[#5B6B7B] h-full rounded-full transition-all duration-1000 ease-out" 
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="font-sans font-bold text-[13px] text-polaris-primary w-6 text-right shrink-0">{lowCount}</span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* CARD 3: Deadlines This Week */}
              <div className="bg-white border border-polaris-border rounded-[14px] p-6 shadow-sm">
                <h3 className="font-serif font-medium text-[16px] text-[#0E1B2A] mb-4">Deadlines This Week</h3>
                {(() => {
                  const now = new Date();
                  const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                  
                  const weekTasks = tasks
                    .map(t => ({ task: t, dl: parseDeadline(t.pillText, t.id) }))
                    .filter(item => item.dl !== null && item.dl >= now && item.dl <= weekEnd)
                    .sort((a, b) => a.dl!.getTime() - b.dl!.getTime());
                    
                  if (weekTasks.length === 0) {
                    return (
                      <div className="flex items-center justify-center py-6 text-polaris-secondary font-sans text-[14px]">
                        You're clear for the week 🎉
                      </div>
                    );
                  }
                  
                  return (
                    <div className="flex flex-col gap-3">
                      {weekTasks.map(({ task, dl }) => {
                        let dotColor = '#5B6B7B';
                        if (task.urgency === 'high') dotColor = '#B23A2E';
                        else if (task.urgency === 'medium') dotColor = '#C8893B';
                        
                        const diffDays = Math.ceil((dl!.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
                        let daysAwayText = `In ${diffDays} days`;
                        if (dl!.toDateString() === now.toDateString()) {
                          daysAwayText = 'Today';
                        } else {
                          const tomorrow = new Date(now);
                          tomorrow.setDate(tomorrow.getDate() + 1);
                          if (dl!.toDateString() === tomorrow.toDateString()) {
                            daysAwayText = 'Tomorrow';
                          }
                        }
                        
                        return (
                          <div key={task.id} className="flex items-center gap-3 border-b border-[rgba(14,27,42,0.04)] pb-2 last:border-0 last:pb-0">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
                            <span className="font-sans text-[13px] text-polaris-primary truncate flex-1">{task.title}</span>
                            <span className="font-sans text-[12px] text-polaris-secondary shrink-0">{daysAwayText}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* CARD 4: Polaris Impact */}
              <div className="bg-white border border-polaris-border rounded-[14px] p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-medium text-[16px] text-[#0E1B2A] mb-4">Polaris Impact</h3>
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-baseline">
                      <span className="font-sans text-[13px] text-polaris-secondary">Deadlines found via inbox scan</span>
                      <span className="font-sans font-bold text-[16px] text-polaris-primary">{scannedCount}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="font-sans text-[13px] text-polaris-secondary">Tasks completed this session</span>
                      <span className="font-sans font-bold text-[16px] text-[#0F9D58]">{completedCount}</span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-[rgba(14,27,42,0.08)] pt-4 mt-4 text-center">
                  <p className="font-serif italic text-[14px] text-polaris-primary">
                    "Polaris found what you almost missed."
                  </p>
                </div>
              </div>

              {/* CARD 5: Point-of-No-Return Alerts */}
              <div className="bg-white border border-polaris-border rounded-[14px] p-6 shadow-sm md:col-span-2">
                <h3 className="font-serif font-medium text-[16px] text-[#0E1B2A] mb-4">Point-of-No-Return Alerts</h3>
                {(() => {
                  const now = new Date();
                  const alertTasks = tasks
                    .map(t => {
                      const dl = parseDeadline(t.pillText, t.id);
                      const duration = getTaskDurationMinutes(t.title);
                      const ponr = dl ? new Date(dl.getTime() - duration * 60 * 1000) : null;
                      return { task: t, ponr };
                    })
                    .filter(item => {
                      if (!item.ponr) return false;
                      const diffMinutes = (item.ponr.getTime() - now.getTime()) / (60 * 1000);
                      return diffMinutes <= 120;
                    });
                    
                  if (alertTasks.length === 0) {
                    return (
                      <div className="flex items-center justify-center py-4 text-[#0F9D58] font-sans font-medium text-[14px]">
                        All clear — no immediate alerts.
                      </div>
                    );
                  }
                  
                  return (
                    <div className="flex flex-col gap-3">
                      {alertTasks.map(({ task, ponr }) => {
                        const diffMinutes = Math.round((ponr!.getTime() - now.getTime()) / (60 * 1000));
                        let timeText = '';
                        if (diffMinutes <= 0) {
                          timeText = 'Passed';
                        } else if (diffMinutes < 60) {
                          timeText = `${diffMinutes} mins remaining`;
                        } else {
                          const hrs = Math.floor(diffMinutes / 60);
                          const mins = diffMinutes % 60;
                          timeText = `${hrs}h ${mins}m remaining`;
                        }
                        
                        return (
                          <div key={task.id} className="flex items-center justify-between gap-4 border-b border-[rgba(14,27,42,0.04)] pb-2 last:border-0 last:pb-0">
                            <span className="font-sans text-[13px] text-polaris-primary font-medium truncate flex-1">
                              {task.title}
                            </span>
                            <span className="font-sans font-bold text-[13px] text-[#B23A2E] shrink-0">
                              {timeText}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inbox' && (
          /* INBOX TAB PANEL (Pixel-perfect Gmail clone) */
          <div id="polaris-inbox-container" className="w-full flex bg-white min-h-[calc(100vh-180px)]">
            
            {/* LEFT SIDEBAR */}
            <aside className="w-[256px] shrink-0 border-r border-[#E5E5E5] bg-white pt-2 flex flex-col select-none">
              {/* Compose Button */}
              <button
                type="button"
                className="m-2 py-4 px-6 rounded-[24px] bg-white border-0 shadow-[0_1px_3px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.15)] flex items-center gap-3 cursor-pointer transition-all duration-150 self-start"
              >
                <span className="material-icons text-[#444746] text-[20px]">edit</span>
                <span className="font-googlesans font-medium text-[14px] text-[#202124]">Compose</span>
              </button>

              {/* Sidebar items */}
              <div className="flex flex-col pr-4 mt-2">
                <div className="flex items-center h-8 px-4 rounded-r-[16px] bg-[#D3E3FD] text-[#001D35] font-googlesans font-bold text-[14px] cursor-pointer">
                  <span className="material-icons mr-4 text-[20px]">inbox</span>
                  <span>Inbox</span>
                  <span className="ml-auto font-bold text-[13px]">8</span>
                </div>

                <div className="flex items-center h-8 px-4 rounded-r-[16px] text-[#202124] hover:bg-[#E2E8F0] font-googlesans font-normal text-[14px] cursor-pointer mt-0.5 transition-colors duration-100">
                  <span className="material-icons mr-4 text-[#444746] text-[20px]">star_border</span>
                  <span>Starred</span>
                </div>

                <div className="flex items-center h-8 px-4 rounded-r-[16px] text-[#202124] hover:bg-[#E2E8F0] font-googlesans font-normal text-[14px] cursor-pointer mt-0.5 transition-colors duration-100">
                  <span className="material-icons mr-4 text-[#444746] text-[20px]">access_time</span>
                  <span>Snoozed</span>
                </div>

                <div className="flex items-center h-8 px-4 rounded-r-[16px] text-[#202124] hover:bg-[#E2E8F0] font-googlesans font-normal text-[14px] cursor-pointer mt-0.5 transition-colors duration-100">
                  <span className="material-icons mr-4 text-[#444746] text-[20px]">label_important</span>
                  <span>Important</span>
                </div>

                <div className="flex items-center h-8 px-4 rounded-r-[16px] text-[#202124] hover:bg-[#E2E8F0] font-googlesans font-normal text-[14px] cursor-pointer mt-0.5 transition-colors duration-100">
                  <span className="material-icons mr-4 text-[#444746] text-[20px]">send</span>
                  <span>Sent</span>
                </div>

                <div className="flex items-center h-8 px-4 rounded-r-[16px] text-[#202124] hover:bg-[#E2E8F0] font-googlesans font-normal text-[14px] cursor-pointer mt-0.5 transition-colors duration-100">
                  <span className="material-icons mr-4 text-[#444746] text-[20px]">description</span>
                  <span>Drafts</span>
                  <span className="ml-auto font-bold text-[13px]">3</span>
                </div>

                <div className="flex items-center h-8 px-4 rounded-r-[16px] text-[#202124] hover:bg-[#E2E8F0] font-googlesans font-normal text-[14px] cursor-pointer mt-0.5 transition-colors duration-100">
                  <span className="material-icons mr-4 text-[#444746] text-[20px]">expand_more</span>
                  <span>Categories</span>
                </div>

                <div className="flex items-center h-8 px-4 rounded-r-[16px] text-[#202124] hover:bg-[#E2E8F0] font-googlesans font-normal text-[14px] cursor-pointer mt-0.5 transition-colors duration-100">
                  <span className="material-icons mr-4 text-[#444746] text-[20px]">note</span>
                  <span>Notes</span>
                </div>

                <div className="flex items-center h-8 px-4 rounded-r-[16px] text-[#202124] hover:bg-[#E2E8F0] font-googlesans font-normal text-[14px] cursor-pointer mt-0.5 transition-colors duration-100">
                  <span className="material-icons mr-4 text-[#444746] text-[20px]">expand_more</span>
                  <span>More</span>
                </div>
              </div>
            </aside>

            {/* EMAIL LIST AREA or READING VIEW */}
            <div className="flex-1 min-w-0 bg-white flex flex-col">
              {currentEmail ? (
                /* READING VIEW */
                <div id="email-detail-view" className="w-full bg-white py-[24px] px-[40px] flex flex-col">
                  {/* Back button */}
                  <button
                    id="email-back-btn"
                    type="button"
                    onClick={() => {
                      setSelectedEmailId(null);
                      setScanResult({ status: null });
                    }}
                    className="flex items-center gap-2 font-sans text-[14px] text-[#444746] hover:text-[#202124] transition-colors cursor-pointer bg-transparent border-none mb-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 self-start"
                  >
                    <span className="text-lg">←</span>
                    <span>Back to Inbox</span>
                  </button>

                  {/* Subject heading + Scan for deadlines button */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h2 id="email-detail-subject" className="font-googlesans font-normal text-[22px] text-[#202124] leading-tight">
                      {currentEmail.subject}
                    </h2>

                    {/* Scan for deadlines section */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <button
                        id="scan-deadlines-btn"
                        type="button"
                        disabled={isScanning}
                        onClick={handleScanForDeadlines}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0E1B2A] hover:bg-[#1a2e42] disabled:bg-[#0E1B2A]/70 text-white font-sans font-medium text-[14px] rounded-[8px] cursor-pointer disabled:cursor-not-allowed transition-colors border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E1B2A]/30 whitespace-nowrap"
                      >
                        {isScanning ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                            <span>Scanning…</span>
                          </>
                        ) : (
                          <>
                            <Search size={16} className="shrink-0" />
                            <span>Scan for deadlines</span>
                          </>
                        )}
                      </button>

                      {scanResult.status === 'success' && (
                        <p id="scan-result-success" className="font-sans text-[13px] text-[#0F9D58] font-normal whitespace-nowrap">
                          ✓ Found {scanResult.count} deadline(s) — added to your Tasks.
                        </p>
                      )}
                      {scanResult.status === 'none' && (
                        <p id="scan-result-none" className="font-sans text-[13px] text-[#5B6B7B] font-normal whitespace-nowrap">
                          No deadlines found in this email.
                        </p>
                      )}
                      {scanResult.status === 'error' && (
                        <p id="scan-result-error" className="font-sans text-[13px] text-[#B23A2E] font-normal whitespace-nowrap">
                          Couldn't scan right now — try again.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Sender Row */}
                  <div className="flex items-center gap-3 w-full">
                    {/* Avatar */}
                    <div
                      style={{ backgroundColor: currentEmail.avatarColor }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-[13px] ${
                        currentEmail.textColor === 'white' ? 'text-white' : 'text-[#202124]'
                      } shrink-0`}
                    >
                      {currentEmail.avatarLetter}
                    </div>
                    {/* Sender name + to me */}
                    <div className="flex items-baseline gap-1.5 min-w-0">
                      <span className="font-sans font-medium text-[14px] text-[#202124] truncate">
                        {currentEmail.from}
                      </span>
                      <span className="font-sans font-normal text-[13px] text-[#5F6368] shrink-0">
                        to me
                      </span>
                    </div>
                    {/* Timestamp right aligned */}
                    <span className="ml-auto font-sans font-normal text-[13px] text-[#5F6368] shrink-0">
                      {currentEmail.time}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="border-b border-[#E5E5E5] my-4 w-full" />

                  {/* Email Body */}
                  <div id="email-detail-body" className="font-sans font-normal text-[14px] text-[#202124] leading-[1.6] whitespace-pre-wrap">
                    {currentEmail.body}
                  </div>
                </div>
              ) : (
                /* EMAIL LIST */
                <div className="flex-1 flex flex-col">
                  
                  {/* TOP TOOLBAR ROW */}
                  <div className="flex items-center p-2 border-b border-[#E5E5E5] gap-1 select-none">
                    <input
                      type="checkbox"
                      className="w-3.5 h-3.5 mx-2 accent-[#001D35] cursor-pointer shrink-0"
                    />
                    <span className="material-icons text-[#5F6368] text-[20px] cursor-pointer hover:bg-gray-100 p-1 rounded-full">
                      arrow_drop_down
                    </span>
                    <span
                      onClick={() => setEmails(INITIAL_EMAILS)}
                      title="Reset email states"
                      className="material-icons text-[#5F6368] text-[20px] cursor-pointer hover:bg-gray-100 p-1 rounded-full"
                    >
                      refresh
                    </span>
                    <span className="material-icons text-[#5F6368] text-[20px] cursor-pointer hover:bg-gray-100 p-1 rounded-full">
                      more_vert
                    </span>

                    <div className="flex-1" />

                    <span className="text-[13px] text-[#444746] font-sans mr-2">1–25 of 299</span>
                    <span className="material-icons text-[#5F6368] text-[20px] cursor-pointer hover:bg-gray-100 p-1 rounded-full">
                      chevron_left
                    </span>
                    <span className="material-icons text-[#5F6368] text-[20px] cursor-pointer hover:bg-gray-100 p-1 rounded-full">
                      chevron_right
                    </span>
                    <span className="material-icons text-[#5F6368] text-[20px] cursor-pointer hover:bg-gray-100 p-1 rounded-full ml-1 mr-2">
                      settings
                    </span>
                  </div>

                  {/* CATEGORY TABS ROW */}
                  <div className="flex border-b border-[#E5E5E5] select-none">
                    {/* Primary tab */}
                    <div className="flex items-center gap-3 p-3 px-4 border-b-3 border-[#D93025] text-[#D93025] font-googlesans font-medium text-[14px] cursor-pointer hover:bg-[#F2F6FC] transition-colors duration-100">
                      <span className="material-icons text-[20px]">inbox</span>
                      <span>Primary</span>
                    </div>

                    {/* Promotions tab */}
                    <div className="flex items-center gap-3 p-3 px-4 text-[#5F6368] font-googlesans font-medium text-[14px] cursor-pointer hover:bg-[#F2F6FC] transition-colors duration-100">
                      <span className="material-icons text-[20px]">local_offer</span>
                      <span>Promotions</span>
                      <span className="bg-[#0F9D58] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-[4px] shrink-0">
                        3 new
                      </span>
                    </div>

                    {/* Updates tab */}
                    <div className="flex items-center gap-3 p-3 px-4 text-[#5F6368] font-googlesans font-medium text-[14px] cursor-pointer hover:bg-[#F2F6FC] transition-colors duration-100">
                      <span className="material-icons text-[20px]">info</span>
                      <span>Updates</span>
                      <span className="w-2 h-2 rounded-full bg-[#FC8019] shrink-0" />
                    </div>

                    {/* Forums tab */}
                    <div className="flex items-center gap-3 p-3 px-4 text-[#5F6368] font-googlesans font-medium text-[14px] cursor-pointer hover:bg-[#F2F6FC] transition-colors duration-100">
                      <span className="material-icons text-[20px]">forum</span>
                      <span>Forums</span>
                    </div>
                  </div>

                  {/* EMAIL ROWS LIST */}
                  <div className="flex flex-col bg-white">
                    {emails.map((email) => {
                      return (
                        <div
                          key={email.id}
                          id={`email-row-${email.id}`}
                          onClick={() => handleOpenEmail(email.id)}
                          className="flex items-center h-[50px] border-b border-[#F1F3F4] cursor-pointer bg-white hover:shadow-[0_4px_4px_-2px_rgba(0,0,0,0.2)] hover:bg-[#F2F6FC] transition-all duration-150 select-none px-4 gap-2"
                        >
                          {/* Unread indicator red dot or empty spacer */}
                          {email.unread ? (
                            <div className="w-[8px] h-[8px] rounded-full bg-[#D93025] mx-[8px] shrink-0" />
                          ) : (
                            <div className="w-[8px] mx-[8px] shrink-0" />
                          )}

                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            onClick={(e) => e.stopPropagation()}
                            className="w-3.5 h-3.5 accent-[#001D35] cursor-pointer shrink-0"
                          />

                          {/* Star Icon */}
                          <span
                            onClick={(e) => toggleStar(email.id, e)}
                            className={`material-icons text-[20px] select-none shrink-0 cursor-pointer transition-colors ${
                              email.starred ? 'text-[#F4B400]' : 'text-[#5F6368] hover:text-gray-600'
                            }`}
                          >
                            {email.starred ? 'star' : 'star_border'}
                          </span>

                          {/* Important Indicator */}
                          <span
                            onClick={(e) => toggleImportant(email.id, e)}
                            className={`material-icons text-[20px] select-none shrink-0 cursor-pointer transition-colors ${
                              email.important ? 'text-[#F4B400]' : 'text-[#5F6368] hover:text-gray-600'
                            }`}
                          >
                            {email.important ? 'label_important' : 'label_important_outline'}
                          </span>

                          {/* Avatar */}
                          <div
                            style={{ backgroundColor: email.avatarColor }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-[13px] ${
                              email.textColor === 'white' ? 'text-white' : 'text-[#202124]'
                            } my-0 mx-[10px] shrink-0`}
                          >
                            {email.avatarLetter}
                          </div>

                          {/* Sender Name */}
                          <div
                            className={`w-[160px] shrink-0 text-[13px] font-googlesans whitespace-nowrap overflow-hidden text-ellipsis pr-2 ${
                              email.unread ? 'font-bold text-[#202124]' : 'font-normal text-[#202124]'
                            }`}
                          >
                            {email.from}
                          </div>

                          {/* Subject & Preview */}
                          <div className="flex-1 min-w-0 flex items-baseline text-[13px] overflow-hidden whitespace-nowrap text-ellipsis mr-2">
                            <span className={`${email.unread ? 'font-bold text-[#202124]' : 'font-normal text-[#202124]'}`}>
                              {email.subject}
                            </span>
                            <span className="text-[#5F6368] font-normal mx-1">—</span>
                            <span className="text-[#5F6368] font-normal truncate">
                              {email.body.replace(/\s+/g, ' ').trim()}
                            </span>
                          </div>

                          {/* Category pill if any */}
                          {email.pillText && (
                            <span
                              style={{
                                backgroundColor: email.pillBg,
                                color: email.pillColor,
                              }}
                              className="shrink-0 text-[11px] font-medium px-1.5 py-0.5 rounded-[4px] font-sans"
                            >
                              {email.pillText}
                            </span>
                          )}

                          {/* Timestamp */}
                          <div className="w-[80px] text-right text-[12px] text-[#5F6368] flex-shrink-0 font-normal">
                            {email.time}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              )}
            </div>

          </div>
        )}
      </main>

      {/* Escape Hatch Draft Modal Overlay */}
      {isEscapeModalOpen && (
        <div 
          onClick={() => setIsEscapeModalOpen(false)}
          className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.4)] backdrop-blur-[1px] flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white max-w-[520px] w-full rounded-[16px] p-7 shadow-2xl relative flex flex-col gap-4"
          >
            {/* Close Button top-right */}
            <button
              type="button"
              onClick={() => setIsEscapeModalOpen(false)}
              className="absolute top-5 right-5 text-polaris-secondary hover:text-polaris-primary text-[20px] border-0 bg-transparent cursor-pointer font-sans"
            >
              ✕
            </button>

            {/* Title & Subtitle */}
            <div>
              <h2 className="font-serif font-medium text-[20px] text-[#0E1B2A] mb-1.5">
                Escape Hatch Draft
              </h2>
              <p className="font-sans font-normal text-[13px] text-[#5B6B7B]">
                Review and copy this message before sending.
              </p>
            </div>

            {/* Draft Box */}
            <div className="bg-[#F7F5F0] rounded-[8px] p-4 text-[14px] text-[#0E1B2A] font-sans leading-relaxed border border-[rgba(14,27,42,0.06)] max-h-[220px] overflow-y-auto">
              {escapeDraftText}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => setIsEscapeModalOpen(false)}
                className="px-4 py-2 bg-transparent text-polaris-primary border border-[rgba(14,27,42,0.2)] font-sans font-medium text-[13px] rounded-[8px] hover:bg-[rgba(14,27,42,0.03)] active:scale-98 transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(escapeDraftText);
                  setCopyButtonText('✓ Copied!');
                  setTimeout(() => {
                    setCopyButtonText('Copy to clipboard');
                  }, 2000);
                }}
                className="px-4 py-2 bg-[#0E1B2A] text-white font-sans font-medium text-[13px] rounded-[8px] hover:bg-opacity-90 active:scale-98 transition-all cursor-pointer"
              >
                {copyButtonText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Renegotiation Modal Overlay */}
      {isRenegotiateModalOpen && renegotiatePlan && (
        <div 
          id="renegotiate-modal-backdrop"
          onClick={() => setIsRenegotiateModalOpen(false)}
          className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.4)] backdrop-blur-[1px] flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white max-w-[600px] w-full max-h-[80vh] overflow-y-auto rounded-[16px] p-7 shadow-2xl relative flex flex-col gap-6"
          >
            {/* Close Button top-right */}
            <button
              id="close-renegotiate-modal"
              type="button"
              onClick={() => setIsRenegotiateModalOpen(false)}
              className="absolute top-5 right-5 text-polaris-secondary hover:text-polaris-primary text-[20px] border-0 bg-transparent cursor-pointer font-sans"
            >
              ✕
            </button>

            {/* Title & Subtitle */}
            <div>
              <h2 className="font-serif font-medium text-[22px] text-[#0E1B2A] mb-1.5">
                Renegotiation Plan
              </h2>
              <p className="font-sans font-normal text-[13px] text-[#5B6B7B]">
                Here's what Polaris recommends given your current load.
              </p>
            </div>

            {/* Section 1: Protect */}
            {renegotiatePlan.protect && renegotiatePlan.protect.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="font-sans font-medium text-[13px] uppercase tracking-[0.05em] text-[#0F9D58]">
                  ✓ Protect these
                </h3>
                {renegotiatePlan.protect.map((t, idx) => (
                  <div 
                    key={idx} 
                    style={{ borderLeft: '3px solid #0F9D58' }}
                    className="bg-[rgba(15,157,88,0.04)] rounded-[8px] p-3 px-4 flex flex-col gap-1"
                  >
                    <div className="font-sans font-medium text-[14px] text-[#0E1B2A]">
                      {t.title}
                    </div>
                    <div className="font-sans text-[13px] text-[#5B6B7B]">
                      {t.reason}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Section 2: Request Extension */}
            {renegotiatePlan.extend && renegotiatePlan.extend.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="font-sans font-medium text-[13px] uppercase tracking-[0.05em] text-[#C8893B]">
                  ⏳ Request an extension
                </h3>
                {renegotiatePlan.extend.map((t, idx) => (
                  <div 
                    key={idx} 
                    style={{ borderLeft: '3px solid #C8893B' }}
                    className="bg-[rgba(200,137,59,0.06)] rounded-[8px] p-3 px-4 flex flex-col gap-2"
                  >
                    <div>
                      <div className="font-sans font-medium text-[14px] text-[#0E1B2A]">
                        {t.title}
                      </div>
                      <div className="font-sans text-[13px] text-[#5B6B7B] mt-0.5">
                        {t.reason}
                      </div>
                    </div>
                    {t.draft && (
                      <div className="flex flex-col gap-2">
                        <div className="bg-[#F7F5F0] rounded-[6px] p-2.5 px-3 text-[13px] text-[#0E1B2A] font-sans leading-relaxed">
                          {t.draft}
                        </div>
                        <div className="flex justify-start">
                          <button
                            type="button"
                            onClick={() => copyDraftToClipboard(t.title, t.draft)}
                            className="px-3 py-1.5 bg-transparent text-polaris-primary border border-[rgba(14,27,42,0.2)] font-sans font-medium text-[12px] rounded-[6px] hover:bg-[rgba(14,27,42,0.03)] active:scale-98 transition-all cursor-pointer"
                          >
                            {copiedDrafts[t.title] ? '✓ Copied!' : 'Copy draft'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Section 3: Drop or Defer */}
            {renegotiatePlan.drop && renegotiatePlan.drop.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="font-sans font-medium text-[13px] uppercase tracking-[0.05em] text-[#5B6B7B]">
                  ✗ Drop or defer
                </h3>
                {renegotiatePlan.drop.map((t, idx) => (
                  <div 
                    key={idx} 
                    style={{ borderLeft: '3px solid #5B6B7B' }}
                    className="bg-[rgba(91,107,123,0.06)] rounded-[8px] p-3 px-4 flex flex-col gap-2"
                  >
                    <div>
                      <div className="font-sans font-medium text-[14px] text-[#0E1B2A]">
                        {t.title}
                      </div>
                      <div className="font-sans text-[13px] text-[#5B6B7B] mt-0.5">
                        {t.reason}
                      </div>
                    </div>
                    {t.draft && (
                      <div className="flex flex-col gap-2">
                        <div className="bg-[#F7F5F0] rounded-[6px] p-2.5 px-3 text-[13px] text-[#0E1B2A] font-sans leading-relaxed">
                          {t.draft}
                        </div>
                        <div className="flex justify-start">
                          <button
                            type="button"
                            onClick={() => copyDraftToClipboard(t.title, t.draft)}
                            className="px-3 py-1.5 bg-transparent text-polaris-primary border border-[rgba(14,27,42,0.2)] font-sans font-medium text-[12px] rounded-[6px] hover:bg-[rgba(14,27,42,0.03)] active:scale-98 transition-all cursor-pointer"
                          >
                            {copiedDrafts[t.title] ? '✓ Copied!' : 'Copy draft'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
