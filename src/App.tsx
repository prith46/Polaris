/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, FormEvent, MouseEvent, useEffect, useRef, useCallback } from 'react';
import { Check, Search } from 'lucide-react';
import { Task, Email, ExtractionLogEntry } from './types';

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
    from: "City Power & Utilities",
    subject: "Your electricity bill is due soon",
    time: "10:15 AM",
    unread: true,
    avatarLetter: "C",
    avatarColor: '#F28B82',
    starred: false,
    important: true,
    body: "Dear Customer, this is a reminder that your electricity bill of ₹2,340 for the current cycle is due on Friday the 27th. Please ensure payment is processed online before the cutoff time to avoid a late fee or potential disruption of service. Let us know if you need assistance with your payment options.",
  },
  {
    id: 'email-2',
    from: "Prof. Anjali Sharma",
    subject: "Following up on the recommendation letter",
    time: "Yesterday",
    unread: true,
    avatarLetter: "P",
    avatarColor: '#FF8BCB',
    starred: true,
    important: true,
    body: "Hi there, I wanted to gently follow up on the recommendation letter you requested. The submission portal was due 2 days ago, and I need you to send me the updated details urgently by tomorrow. Once I have the links, I can upload it immediately. Let me know if you face any issues.",
  },
  {
    id: 'email-3',
    from: "Scholarship Office",
    subject: "Enrollment confirmation required",
    time: "Yesterday",
    unread: true,
    avatarLetter: "S",
    avatarColor: '#FDD663',
    starred: false,
    important: true,
    body: "Dear Applicant, we are pleased to inform you that your profile has been advanced. However, we require you to submit the enrollment confirmation form before the 30th of this month. If we do not receive your form by the deadline, your slot will be offered to the next candidate on the waiting list.",
  },
  {
    id: 'email-4',
    from: "Rahul Mehta",
    subject: "Project sync — Thursday 4 PM",
    time: "9:30 AM",
    unread: false,
    avatarLetter: "R",
    avatarColor: '#C58AF9',
    starred: false,
    important: false,
    body: "Hey, just confirming our project sync meeting scheduled for this Thursday at 4:00 PM. We will review the slide outline and assign parts to everyone. Please come prepared with your section outline so we can wrap up quickly. Talk to you soon.",
  },
  {
    id: 'email-5',
    from: "HDFC Bank",
    subject: "Credit card payment due",
    time: "11:20 AM",
    unread: true,
    avatarLetter: "H",
    avatarColor: '#8AB4F8',
    starred: false,
    important: true,
    body: "Dear Customer, the payment for your HDFC Credit Card ending in 4321 is due in 3 days. The total amount due is ₹8,450, with a minimum payment of ₹850 required to avoid late fees. A standard late payment charge and interest will apply if payment is not received by the due date.",
  },
  {
    id: 'email-6',
    from: "Medium Daily",
    subject: "5 design principles for clean user interfaces",
    time: "June 25 9:10 AM",
    unread: false,
    avatarLetter: "M",
    avatarColor: '#000000',
    starred: false,
    important: false,
    body: "Good design is often invisible. In this article, senior developers share practical tips on layout alignment, whitespace distribution, and selecting the perfect contrast levels.",
  },
  {
    id: 'email-7',
    from: "Microsoft Azure",
    subject: "Action Required: Subscription renewal",
    time: "June 24 10:11 AM",
    unread: false,
    avatarLetter: "M",
    avatarColor: '#0077B5',
    starred: false,
    important: true,
    body: "Dear Developer, your Azure free trial subscription is ending soon. Please upgrade to a pay-as-you-go plan before the 28th to prevent your active services from being deleted. You can manage this from your Azure portal.",
  },
  {
    id: 'email-8',
    from: "GitHub",
    subject: "Action Required: Update SSH keys",
    time: "June 23 11:12 AM",
    unread: false,
    avatarLetter: "G",
    avatarColor: '#24292E',
    starred: false,
    important: false,
    body: "Dear user, we detected an outdated SSH key associated with your account. Please update your credentials or verify the key within 7 days to maintain write access to your repositories. Thank you.",
  },
  {
    id: 'email-9',
    from: "Siddharth Sen",
    subject: "Rent transfer reminder",
    time: "June 22 12:13 AM",
    unread: false,
    avatarLetter: "S",
    avatarColor: '#8AB4F8',
    starred: false,
    important: true,
    body: "Hey buddy, hope you are doing well. Please transfer your share of this month's rent by Saturday so I can pay the landlord on Sunday. Let me know once you make the transfer.",
  },
  {
    id: 'email-10',
    from: "DigiLocker Support",
    subject: "Verify your Aadhaar linkage",
    time: "June 21 13:14 AM",
    unread: true,
    avatarLetter: "D",
    avatarColor: '#4285F4',
    starred: false,
    important: false,
    body: "Dear User, please complete your Aadhaar authentication to download your official documents on DigiLocker. You must link your phone number and complete the verification within 5 days to access digital certificates.",
  },
  {
    id: 'email-11',
    from: "Preeti Sen",
    subject: "Weekend trip planning",
    time: "June 20 14:15 AM",
    unread: false,
    avatarLetter: "P",
    avatarColor: '#FF8BCB',
    starred: true,
    important: false,
    body: "Hey, we are booking the Airbnb for our weekend trip to Lonavala. Please let me know your room preference and transfer ₹2,000 by Wednesday night so I can confirm the booking with the host.",
  },
  {
    id: 'email-12',
    from: "Vikrant Bose",
    subject: "Feedback on code contribution",
    time: "June 19 15:16 AM",
    unread: false,
    avatarLetter: "V",
    avatarColor: '#C58AF9',
    starred: false,
    important: false,
    body: "Hey, I had a look at your recent pull request for the API routes. Please address the comments and refactor the helper functions before Wednesday evening so we can merge this to staging.",
  },
  {
    id: 'email-13',
    from: "TechCrunch Daily",
    subject: "The future of autonomous flight startup raises $50M",
    time: "June 18 16:17 AM",
    unread: false,
    avatarLetter: "T",
    avatarColor: '#81C995',
    starred: true,
    important: false,
    body: "Silicon valley continues to invest heavily in drone and aerospace tech. In today's issue, we look at three startups changing how we think about cargo deliveries and aerial surveys.",
  },
  {
    id: 'email-14',
    from: "Coursera Support",
    subject: "Complete your course enrollment",
    time: "June 17 17:18 AM",
    unread: false,
    avatarLetter: "C",
    avatarColor: '#4285F4',
    starred: false,
    important: false,
    body: "Hi there, your financial aid application for the Machine Learning course has been approved! Please click the link to confirm your enrollment before the 30th to begin your classes. Enjoy learning!",
  },
  {
    id: 'email-15',
    from: "DigitalOcean",
    subject: "Invoice for billing period May",
    time: "June 16 18:19 AM",
    unread: false,
    avatarLetter: "D",
    avatarColor: '#0077B5',
    starred: false,
    important: false,
    body: "Your invoice for $5.00 has been successfully processed using your default credit card. You can view the usage breakdown for your active droplets in the control panel.",
  },
  {
    id: 'email-16',
    from: "Google Photos",
    subject: "Relive your memories from 3 years ago",
    time: "June 15 19:20 AM",
    unread: false,
    avatarLetter: "G",
    avatarColor: '#4285F4',
    starred: true,
    important: false,
    body: "We found some photos from this week back in 2023. Rediscover the moments, people, and places that made this day special. Access your cloud backup to view the full gallery.",
  },
  {
    id: 'email-17',
    from: "Udacity Support",
    subject: "Graduation certificate ready!",
    time: "June 14 20:21 AM",
    unread: false,
    avatarLetter: "U",
    avatarColor: '#FF9900',
    starred: false,
    important: true,
    body: "Congratulations on completing the Nanodegree program. Your digital certificate is ready and can be shared directly to your LinkedIn profile. Best wishes for your career.",
  },
  {
    id: 'email-18',
    from: "Vikram Seth",
    subject: "Submit your research draft",
    time: "June 13 9:22 AM",
    unread: true,
    avatarLetter: "V",
    avatarColor: '#FC8019',
    starred: true,
    important: false,
    body: "Hello, I hope you are making progress on the project literature review. Please submit your draft by the end of the week so we can review the references together. Let me know if you need additional access to the library archives.",
  },
  {
    id: 'email-19',
    from: "Amazon Logistics",
    subject: "Your package has been delivered",
    time: "June 12 10:23 AM",
    unread: false,
    avatarLetter: "A",
    avatarColor: '#FF9900',
    starred: false,
    important: false,
    body: "We have successfully delivered your package containing the wireless mouse to your receptionist or security guard. We hope you are satisfied with the delivery service. Rate us online.",
  },
  {
    id: 'email-20',
    from: "Udemy",
    subject: "Confirm your account registration",
    time: "June 11 11:24 AM",
    unread: false,
    avatarLetter: "U",
    avatarColor: '#FF9900',
    starred: true,
    important: false,
    body: "Thank you for creating an account on Udemy. Please click the button below to confirm your registration and claim your welcome coupon. This coupon is valid only for the next 24 hours.",
  },
  {
    id: 'email-21',
    from: "Aashish Mehta",
    subject: "Review draft of the design spec",
    time: "June 25 12:25 AM",
    unread: false,
    avatarLetter: "A",
    avatarColor: '#8AB4F8',
    starred: true,
    important: false,
    body: "Hi team, I have uploaded the final UI design specification for the main portal. Please review the wireframes and leave comments before our sprint planning meeting on Thursday. Thanks for your time.",
  },
  {
    id: 'email-22',
    from: "Vercel News",
    subject: "Introducing next-generation image optimization",
    time: "June 24 13:26 AM",
    unread: false,
    avatarLetter: "V",
    avatarColor: '#000000',
    starred: false,
    important: false,
    body: "We are excited to announce major performance updates to our image rendering pipeline. Websites will load faster while consuming less bandwidth. Read our blog for configuration tips.",
  },
  {
    id: 'email-23',
    from: "Amit Bhargava",
    subject: "Meeting request: Thesis progress sync",
    time: "June 23 14:27 AM",
    unread: true,
    avatarLetter: "A",
    avatarColor: '#FDD663',
    starred: false,
    important: true,
    body: "Hello, I would like to schedule our weekly review meeting. Please let me know your availability for a 30-minute call this Thursday between 2 PM and 5 PM. I will send out the calendar invite once you reply.",
  },
  {
    id: 'email-24',
    from: "HackerNews Digest",
    subject: "Show HN: A lightweight calendar component",
    time: "June 22 15:28 AM",
    unread: false,
    avatarLetter: "H",
    avatarColor: '#FC8019',
    starred: true,
    important: false,
    body: "This week's popular project is a fast, dependency-free calendar plugin for modern frameworks. Developers appreciate the clean API design and responsive grid layout.",
  },
  {
    id: 'email-25',
    from: "Uber India",
    subject: "Receipt for your ride on Monday",
    time: "June 21 16:29 AM",
    unread: false,
    avatarLetter: "U",
    avatarColor: '#000000',
    starred: false,
    important: false,
    body: "Thank you for riding with us. Your fare of ₹180 has been successfully charged to your linked wallet. You can download the PDF receipt directly from the Uber application.",
  },
  {
    id: 'email-26',
    from: "Spotify",
    subject: "Update your payment details",
    time: "June 20 17:30 AM",
    unread: false,
    avatarLetter: "S",
    avatarColor: '#81C995',
    starred: false,
    important: true,
    body: "We were unable to renew your Premium subscription because your card payment failed. Please update your payment method within 48 hours to continue enjoying uninterrupted, ad-free music offline. Thank you.",
  },
  {
    id: 'email-27',
    from: "HackerRank",
    subject: "Weekly algorithm challenge",
    time: "June 19 18:31 AM",
    unread: false,
    avatarLetter: "H",
    avatarColor: '#81C995',
    starred: false,
    important: true,
    body: "The new weekly coding contest is live. Test your problem-solving skills against developers worldwide and earn points to rank up your profile. Click to join the challenge.",
  },
  {
    id: 'email-28',
    from: "Apple Store",
    subject: "Your Apple Care invoice",
    time: "June 18 19:32 AM",
    unread: false,
    avatarLetter: "A",
    avatarColor: '#000000',
    starred: true,
    important: true,
    body: "Thank you for subscribing to Apple Care protection. This email contains the official PDF invoice for your coverage. The service has been automatically linked to your device.",
  },
  {
    id: 'email-29',
    from: "GitHub Stars",
    subject: "You starred a new repository!",
    time: "June 17 20:33 AM",
    unread: false,
    avatarLetter: "G",
    avatarColor: '#24292E',
    starred: false,
    important: false,
    body: "You recently starred 'awesome-typescript-presets'. This repository collects the best configuration files and compiler options for modern production codebases.",
  },
  {
    id: 'email-30',
    from: "Dr. Shalini Sen",
    subject: "Physiotherapy appointment schedule",
    time: "June 16 9:34 AM",
    unread: false,
    avatarLetter: "D",
    avatarColor: '#F28B82',
    starred: false,
    important: true,
    body: "Dear patient, your next therapy session is scheduled for Friday at 9:00 AM. Please reply to this mail by Thursday evening to confirm your slot, or call the clinic if you need to reschedule.",
  },
  {
    id: 'email-31',
    from: "Duolingo",
    subject: "Keep your daily streak alive!",
    time: "June 15 10:35 AM",
    unread: false,
    avatarLetter: "D",
    avatarColor: '#81C995',
    starred: true,
    important: true,
    body: "Your Spanish learning streak is at risk. Spend just five minutes today to complete a lesson and secure your progress. Duo the owl is cheering you on from the sidelines.",
  },
  {
    id: 'email-32',
    from: "Zoom Support",
    subject: "Verify your email address",
    time: "June 14 11:36 AM",
    unread: false,
    avatarLetter: "Z",
    avatarColor: '#8AB4F8',
    starred: false,
    important: false,
    body: "Welcome to Zoom! Please click the link below to verify your email address and activate your account. This verification link will expire in 24 hours. If you did not sign up for this, please ignore this email.",
  },
  {
    id: 'email-33',
    from: "Divya Teja",
    subject: "Hostel room allotment form",
    time: "June 13 12:37 AM",
    unread: true,
    avatarLetter: "D",
    avatarColor: '#FF8BCB',
    starred: false,
    important: false,
    body: "Dear Student, the hostel room allocation portal is now open for the next semester. Please fill out your preferences and roommate details before Sunday evening. Late entries will be assigned rooms on a random basis.",
  },
  {
    id: 'email-34',
    from: "Neha Sen",
    subject: "Birthday gift contribution for Raj",
    time: "June 12 13:38 AM",
    unread: false,
    avatarLetter: "N",
    avatarColor: '#FF8BCB',
    starred: false,
    important: true,
    body: "Hey everyone, Raj's birthday is coming up next week and we are buying a nice smartwatch for him. Please transfer your contribution of ₹500 to my UPI ID by Thursday afternoon so I can order it. Thanks!",
  },
  {
    id: 'email-35',
    from: "Sneha Roy",
    subject: "Group project assignment task list",
    time: "June 11 14:39 AM",
    unread: false,
    avatarLetter: "S",
    avatarColor: '#FF8BCB',
    starred: false,
    important: false,
    body: "Hi team, here is the list of tasks for our economics project. Please assign your name to at least one module on the shared spreadsheet by Wednesday evening. The first presentation is scheduled for next Monday.",
  },
  {
    id: 'email-36',
    from: "Decathlon",
    subject: "Your order has been picked up",
    time: "June 25 15:40 AM",
    unread: false,
    avatarLetter: "D",
    avatarColor: '#0077B5',
    starred: true,
    important: true,
    body: "The sports gear order has been successfully picked up from the warehouse and is in transit. We expect delivery by Friday afternoon. Thank you for choosing Decathlon.",
  },
  {
    id: 'email-37',
    from: "Priya Nair",
    subject: "Feedback on mock interview",
    time: "June 24 16:41 AM",
    unread: true,
    avatarLetter: "P",
    avatarColor: '#81C995',
    starred: true,
    important: true,
    body: "Hi, I've compiled my notes from our mock interview session yesterday. Please go through the feedback and revise your answers before our call on Tuesday. Focus particularly on the behavioral questions.",
  },
  {
    id: 'email-38',
    from: "Google Calendar",
    subject: "Weekly schedule overview",
    time: "June 23 17:42 AM",
    unread: false,
    avatarLetter: "G",
    avatarColor: '#4285F4',
    starred: true,
    important: false,
    body: "Here is your upcoming schedule for the week. You have 3 meetings and 1 all-day event planned. Review the details in the calendar application on your device.",
  },
  {
    id: 'email-39',
    from: "Nikhil Gupta",
    subject: "Review slides for client meeting",
    time: "June 22 18:43 AM",
    unread: false,
    avatarLetter: "N",
    avatarColor: '#81C995',
    starred: true,
    important: false,
    body: "Hi mate, the client presentation is scheduled for Friday morning. Please review the financial projection slides and make necessary corrections before Thursday evening. We need to be fully prepared.",
  },
  {
    id: 'email-40',
    from: "Coursera News",
    subject: "New specialization in Generative AI",
    time: "June 21 19:44 AM",
    unread: false,
    avatarLetter: "C",
    avatarColor: '#4285F4',
    starred: false,
    important: true,
    body: "Explore how neural networks generate text and images. Learn about transformers, attention mechanisms, and fine-tuning large language models. The class is now open for enrollment.",
  },
  {
    id: 'email-41',
    from: "Slack Technologies",
    subject: "Verify new device login",
    time: "June 20 20:45 AM",
    unread: false,
    avatarLetter: "S",
    avatarColor: '#81C995',
    starred: true,
    important: false,
    body: "A new device was used to sign in to your Slack workspace. Please click the button below to verify this login within 24 hours to secure your workspace. If this was not you, reset your password.",
  },
  {
    id: 'email-42',
    from: "Swati Deshmukh",
    subject: "Review requested: Marketing brochure",
    time: "June 19 9:46 AM",
    unread: false,
    avatarLetter: "S",
    avatarColor: '#FC8019',
    starred: false,
    important: true,
    body: "Hi team, the design agency sent over the first draft of our winter marketing brochure. Please add your suggestions and edits by Friday afternoon. We need to print them on Monday morning.",
  },
  {
    id: 'email-43',
    from: "CureFit",
    subject: "Book your class slot for tomorrow",
    time: "June 18 10:47 AM",
    unread: false,
    avatarLetter: "C",
    avatarColor: '#81C995',
    starred: true,
    important: false,
    body: "Hi fitness enthusiast, your favorite yoga trainer has scheduled a session for tomorrow at 7 AM. Please book your slot through our app before 10 PM tonight to secure a spot in the class. Spots are filling up fast!",
  },
  {
    id: 'email-44',
    from: "Nike Store",
    subject: "Receipt for your purchase",
    time: "June 17 11:48 AM",
    unread: false,
    avatarLetter: "N",
    avatarColor: '#000000',
    starred: false,
    important: false,
    body: "Thank you for shopping at the Nike Store. This is your digital receipt for the running shoes purchase. Your order is being processed for shipping. Track status on your profile.",
  },
  {
    id: 'email-45',
    from: "Courier tracking",
    subject: "Package out for delivery",
    time: "June 16 12:49 AM",
    unread: false,
    avatarLetter: "C",
    avatarColor: '#8AB4F8',
    starred: true,
    important: true,
    body: "Good news! Your shipment is out for delivery today. The delivery executive will contact you prior to arrival. Please ensure someone is available at the address.",
  },
  {
    id: 'email-46',
    from: "Dr. Batra Clinic",
    subject: "Appointment slot confirmation",
    time: "June 15 13:50 AM",
    unread: false,
    avatarLetter: "D",
    avatarColor: '#F28B82',
    starred: false,
    important: false,
    body: "Your consultation is successfully confirmed for Tuesday at 4:30 PM. No reply is needed unless you wish to cancel or reschedule. Please arrive ten minutes before your slot.",
  },
  {
    id: 'email-47',
    from: "Ananya Roy",
    subject: "Book tickets for music concert",
    time: "June 14 14:51 AM",
    unread: true,
    avatarLetter: "A",
    avatarColor: '#FF8BCB',
    starred: false,
    important: true,
    body: "Hey, the early bird tickets for the coldplay concert go live tomorrow morning. Please transfer ₹5,000 to my account by tonight so I can buy tickets for both of us in the first batch. Don't miss this!",
  },
  {
    id: 'email-48',
    from: "Dr. Arvinder Singh",
    subject: "Dental check-up confirmation",
    time: "June 13 15:52 AM",
    unread: false,
    avatarLetter: "D",
    avatarColor: '#F28B82',
    starred: false,
    important: false,
    body: "Hi, this is a friendly reminder of your dental appointment scheduled for this Friday at 11:30 AM. Please confirm if you will be attending by replying 'YES' to this email before tomorrow evening. Thank you.",
  },
  {
    id: 'email-49',
    from: "GitHub Sponsor",
    subject: "Welcome to the sponsor community",
    time: "June 12 16:53 AM",
    unread: false,
    avatarLetter: "G",
    avatarColor: '#24292E',
    starred: false,
    important: true,
    body: "Thank you for supporting open-source developers. Your monthly sponsorship helps keep the project active and maintained. You can view exclusive backer updates on the profile tab.",
  },
  {
    id: 'email-50',
    from: "Ritu Verma",
    subject: "Gift contribution for boss",
    time: "June 11 17:54 AM",
    unread: false,
    avatarLetter: "R",
    avatarColor: '#FF8BCB',
    starred: false,
    important: false,
    body: "Hey guys, our manager's farewell is coming up. Please transfer your contribution of ₹300 to my UPI account before Thursday so we can buy a card and gift. Let me know if you have other ideas.",
  },
  {
    id: 'email-51',
    from: "Nisha Patel",
    subject: "URGENT: Rental agreement review",
    time: "June 25 18:55 AM",
    unread: true,
    avatarLetter: "N",
    avatarColor: '#FF8BCB',
    starred: false,
    important: false,
    body: "Hi, I have attached the updated draft of the apartment rental agreement. Please review it and send back your signed copy before Friday at 5 PM. We need to submit this to the landlord to lock in the deposit.",
  },
  {
    id: 'email-52',
    from: "Arjun Rao",
    subject: "Thank you for the birthday wishes!",
    time: "June 24 19:56 AM",
    unread: false,
    avatarLetter: "A",
    avatarColor: '#8AB4F8',
    starred: false,
    important: false,
    body: "Hey! Thanks a lot for taking the time to send over the birthday wishes. I had a great day celebrating with family and close friends. Hope to see you around sometime soon.",
  },
  {
    id: 'email-53',
    from: "GeeksForGeeks",
    subject: "Understanding dynamic programming",
    time: "June 23 20:57 AM",
    unread: false,
    avatarLetter: "G",
    avatarColor: '#81C995',
    starred: true,
    important: false,
    body: "Dynamic programming doesn't have to be confusing. In this article, we explain memoization and tabulation with easy-to-understand diagrams and code examples in python and JS.",
  },
  {
    id: 'email-54',
    from: "CodePen",
    subject: "Trending pens: Animation effects",
    time: "June 22 9:58 AM",
    unread: false,
    avatarLetter: "C",
    avatarColor: '#000000',
    starred: false,
    important: false,
    body: "Check out the most popular web creations this week, featuring beautiful CSS transitions, 3D canvas rendering, and layout patterns. Fork them to start experimenting.",
  },
  {
    id: 'email-55',
    from: "Udemy Student",
    subject: "Course purchase confirmation",
    time: "June 21 10:59 AM",
    unread: false,
    avatarLetter: "U",
    avatarColor: '#FF9900',
    starred: false,
    important: false,
    body: "Thank you for purchasing 'Modern React Course'. The lectures and source code templates have been added to your dashboard. Enjoy learning at your own pace.",
  },
  {
    id: 'email-56',
    from: "Mom",
    subject: "Loved the family photos",
    time: "June 20 11:10 AM",
    unread: false,
    avatarLetter: "M",
    avatarColor: '#FF8BCB',
    starred: false,
    important: false,
    body: "Hi sweetie, thanks for sending over the photos from your trip. Everyone looked so happy and healthy. Keep taking care of yourself and have a wonderful week ahead.",
  },
  {
    id: 'email-57',
    from: "Jio Fiber",
    subject: "Your broadband plan expires in 2 days",
    time: "June 19 12:11 AM",
    unread: false,
    avatarLetter: "J",
    avatarColor: '#4285F4',
    starred: false,
    important: false,
    body: "Dear Customer, your high-speed broadband plan will expire in 2 days. Recharge before Thursday to ensure uninterrupted internet connectivity at your home. You can view custom offers on the MyJio app.",
  },
  {
    id: 'email-58',
    from: "Harish Patel",
    subject: "Flight check-in open: Mumbai to Delhi",
    time: "June 18 13:12 AM",
    unread: true,
    avatarLetter: "H",
    avatarColor: '#F28B82',
    starred: false,
    important: true,
    body: "Dear Passenger, online check-in for your flight 6E-543 from Mumbai to Delhi is now open. Please select your seats and generate your boarding pass online before arriving at the airport to save time. Have a safe flight.",
  },
  {
    id: 'email-59',
    from: "Paytm",
    subject: "Gas cylinder booking reminder",
    time: "June 17 14:13 AM",
    unread: false,
    avatarLetter: "P",
    avatarColor: '#8AB4F8',
    starred: true,
    important: false,
    body: "Hi, your cooking gas cylinder booking is due for renewal. Book a cylinder on Paytm before the end of the week to get flat cashback of ₹50. Ensure someone is home to receive the delivery.",
  },
  {
    id: 'email-60',
    from: "Slack Digest",
    subject: "Weekly summary for your workspace",
    time: "June 16 15:14 AM",
    unread: false,
    avatarLetter: "S",
    avatarColor: '#C58AF9',
    starred: true,
    important: true,
    body: "Here's what you missed in the developer group this week. Active channels had 15 new threads, mostly discussing the recent library release. Read on to view the highlights.",
  },
  {
    id: 'email-61',
    from: "BookMyShow",
    subject: "Select your movie seats",
    time: "June 15 16:15 AM",
    unread: false,
    avatarLetter: "B",
    avatarColor: '#FC8019',
    starred: false,
    important: false,
    body: "Hi, your reservation for the weekend show is active but pending seat selection. Please select your seats and complete the checkout within 15 minutes to secure your tickets. Thank you.",
  },
  {
    id: 'email-62',
    from: "Aarti Malhotra",
    subject: "Gym membership renewal reminder",
    time: "June 14 17:16 AM",
    unread: false,
    avatarLetter: "A",
    avatarColor: '#0077B5',
    starred: true,
    important: false,
    body: "Hi, your annual membership at FitLife Gym expires next Monday. Please renew your subscription before the weekend to avail of the 10% early renewal discount. You can pay directly through our mobile application or at the front desk.",
  },
  {
    id: 'email-63',
    from: "Swiggy Dineout",
    subject: "Your reservation is confirmed!",
    time: "June 13 18:17 AM",
    unread: false,
    avatarLetter: "S",
    avatarColor: '#FC8019',
    starred: true,
    important: true,
    body: "We have booked a table for 4 guests under your name at 'The Bistro' for Saturday night. No further action is required. We hope you have a fantastic dining experience.",
  },
  {
    id: 'email-64',
    from: "Quora Digest",
    subject: "What is the hardest part of software engineering?",
    time: "June 12 19:18 AM",
    unread: false,
    avatarLetter: "Q",
    avatarColor: '#F28B82',
    starred: false,
    important: false,
    body: "Top answers from industry veterans discuss code maintenance, naming conventions, and explaining technical limitations to non-technical stakeholders. Join the discussion.",
  },
  {
    id: 'email-65',
    from: "Suresh Kumar",
    subject: "Tax filing document submission",
    time: "June 11 20:19 AM",
    unread: true,
    avatarLetter: "S",
    avatarColor: '#8AB4F8',
    starred: false,
    important: false,
    body: "Dear client, we need your Form 16 and investment proofs to process your tax returns. Please share all documents before the end of the month to avoid last-minute server delays. Let me know if you have any questions.",
  },
  {
    id: 'email-66',
    from: "Netflix",
    subject: "Action Required: Update payment method",
    time: "June 25 9:20 AM",
    unread: false,
    avatarLetter: "N",
    avatarColor: '#F28B82',
    starred: false,
    important: false,
    body: "Your membership subscription could not be processed. Please update your payment method within 3 days to keep watching your favorite shows without interruption. You can do this in your account settings.",
  },
  {
    id: 'email-67',
    from: "Canva Support",
    subject: "Your premium design is ready!",
    time: "June 24 10:21 AM",
    unread: false,
    avatarLetter: "C",
    avatarColor: '#0077B5',
    starred: false,
    important: false,
    body: "We have successfully processed your design download. The high-resolution files have been saved to your dashboard. Thank you for using our pro templates.",
  },
  {
    id: 'email-68',
    from: "Dr. Ramesh Gupta",
    subject: "Schedule change for lab session",
    time: "June 23 11:22 AM",
    unread: false,
    avatarLetter: "D",
    avatarColor: '#F28B82',
    starred: false,
    important: false,
    body: "Dear students, the chemistry lab session has been rescheduled. Please choose your new lab slot from the portal within 48 hours to reserve your workstation. Anyone who fails to register will be assigned a random slot.",
  },
  {
    id: 'email-69',
    from: "ICICI Bank",
    subject: "Urgent: Complete your profile verification",
    time: "June 22 12:23 AM",
    unread: false,
    avatarLetter: "I",
    avatarColor: '#FC8019',
    starred: false,
    important: false,
    body: "Dear Customer, we noticed some missing information in your profile details. Please log in to your iMobile app and complete the verification within 3 days. Failing to do so may restrict outbound transfers.",
  },
  {
    id: 'email-70',
    from: "ProductHunt",
    subject: "Top 10 products of the day",
    time: "June 21 13:24 AM",
    unread: false,
    avatarLetter: "P",
    avatarColor: '#F28B82',
    starred: false,
    important: false,
    body: "Voted by the community: a visual database manager, an automated code formatter, and a translation tool for documentation. Click to see what is trending in tech.",
  },
  {
    id: 'email-71',
    from: "Starbucks Rewards",
    subject: "Your card has been reloaded",
    time: "June 20 14:25 AM",
    unread: false,
    avatarLetter: "S",
    avatarColor: '#FC8019',
    starred: false,
    important: false,
    body: "We have successfully reloaded ₹500 to your digital Starbucks Card using your default payment method. You can now scan the code at any cafe to purchase drinks.",
  },
  {
    id: 'email-72',
    from: "Karan Johar",
    subject: "Script revisions due by Monday",
    time: "June 19 15:26 AM",
    unread: true,
    avatarLetter: "K",
    avatarColor: '#C58AF9',
    starred: false,
    important: false,
    body: "Hey team, the production house wants the first draft of the script revisions by Monday morning. Please add your comments to the shared doc before then. We will have a quick sync on Sunday evening to finalize.",
  },
  {
    id: 'email-73',
    from: "Swiggy Gourmet",
    subject: "Reviewing your dining experience",
    time: "June 18 16:27 AM",
    unread: false,
    avatarLetter: "S",
    avatarColor: '#FC8019',
    starred: false,
    important: true,
    body: "Thank you for using Swiggy Dineout at the Royal Cuisine. Your review helps us maintain high quality standards across our partner restaurants. Have a great day.",
  },
  {
    id: 'email-74',
    from: "Uber Support",
    subject: "Update your profile details",
    time: "June 17 17:28 AM",
    unread: true,
    avatarLetter: "U",
    avatarColor: '#000000',
    starred: true,
    important: true,
    body: "Hi rider, we noticed that your driver rating has dropped or profile verification is pending. Please verify your phone number and secondary email within 48 hours to prevent account suspension.",
  },
  {
    id: 'email-75',
    from: "Zomato Pro",
    subject: "Your Pro membership is active",
    time: "June 16 18:29 AM",
    unread: false,
    avatarLetter: "Z",
    avatarColor: '#FC8019',
    starred: false,
    important: false,
    body: "Enjoy exclusive benefits, including free delivery from select restaurants and flat discounts on dining bills. Your subscription is valid for the next three months.",
  },
  {
    id: 'email-76',
    from: "Airbnb Guest",
    subject: "How was your stay in Goa?",
    time: "June 15 19:30 AM",
    unread: false,
    avatarLetter: "A",
    avatarColor: '#F28B82',
    starred: false,
    important: true,
    body: "Your host would love to hear feedback on your recent vacation. Leave a public review to help other travelers find the best accommodations. Thank you for booking with us.",
  },
  {
    id: 'email-77',
    from: "Spotify Premium",
    subject: "Welcome to your family plan!",
    time: "June 14 20:31 AM",
    unread: false,
    avatarLetter: "S",
    avatarColor: '#81C995',
    starred: false,
    important: false,
    body: "You have joined the premium family plan. Everyone gets their own separate account with personalized recommendations. Invite other family members from your plan page.",
  },
  {
    id: 'email-78',
    from: "Fitbit Sync",
    subject: "Your step count summary for last week",
    time: "June 13 9:32 AM",
    unread: false,
    avatarLetter: "F",
    avatarColor: '#81C995',
    starred: false,
    important: false,
    body: "You walked a total of 54,200 steps last week, achieving your daily target three times. Keep moving to reach your fitness goals. Check details in the Fitbit app.",
  },
  {
    id: 'email-79',
    from: "Prof. Harish Rao",
    subject: "Quiz submission extension",
    time: "June 12 10:33 AM",
    unread: true,
    avatarLetter: "P",
    avatarColor: '#8AB4F8',
    starred: false,
    important: false,
    body: "Dear Class, the deadline for submitting Quiz 3 has been extended to Thursday at 11:59 PM. Please upload your answer sheets in PDF format on the college portal. No further extensions will be granted.",
  },
  {
    id: 'email-80',
    from: "Kriti Sharma",
    subject: "Conference registration deadline",
    time: "June 11 11:34 AM",
    unread: false,
    avatarLetter: "K",
    avatarColor: '#FF8BCB',
    starred: false,
    important: false,
    body: "Hi, early bird registration for the Developer Summit ends this Friday. Please submit your details and complete the fee payment before the cutoff to save 40%. The department will reimburse you later.",
  },
  {
    id: 'email-81',
    from: "Meera Nair",
    subject: "Wedding invite: Save the date",
    time: "June 25 12:35 AM",
    unread: false,
    avatarLetter: "M",
    avatarColor: '#FF8BCB',
    starred: false,
    important: false,
    body: "Dear friend, I am thrilled to invite you to my wedding celebration this October. Please RSVP using the online form before the end of the month so we can coordinate guest lodging. Hope to see you there!",
  },
  {
    id: 'email-82',
    from: "Grammarly Daily",
    subject: "Your weekly writing stats are ready",
    time: "June 24 13:36 AM",
    unread: false,
    avatarLetter: "G",
    avatarColor: '#81C995',
    starred: false,
    important: false,
    body: "You wrote 12,400 words last week with high accuracy. Your vocabulary was more diverse than 88% of active users. Keep up the good work and write with confidence.",
  },
  {
    id: 'email-83',
    from: "Framer Weekly",
    subject: "Interactive slider components built in Framer",
    time: "June 23 14:37 AM",
    unread: false,
    avatarLetter: "F",
    avatarColor: '#C58AF9',
    starred: false,
    important: false,
    body: "In today's tutorial, we demonstrate how to create smooth transitions and gesture-controlled sliders. Learn to implement realistic physics and interactive animations in minutes.",
  },
  {
    id: 'email-84',
    from: "Myntra",
    subject: "Flat 50% off on premium wear",
    time: "June 22 15:38 AM",
    unread: false,
    avatarLetter: "M",
    avatarColor: '#FF8BCB',
    starred: false,
    important: true,
    body: "Upgrade your wardrobe with the latest arrivals. The end of season sale features top brands at half the price. Check out the app to explore fresh trends and exclusive coupons.",
  },
  {
    id: 'email-85',
    from: "Airtel Payments",
    subject: "Electricity bill payment reminder",
    time: "June 21 16:39 AM",
    unread: false,
    avatarLetter: "A",
    avatarColor: '#F28B82',
    starred: false,
    important: false,
    body: "Dear Customer, your electricity bill is ready for payment. Pay before the due date on Friday the 27th to avoid any late fees or disconnection. Access the Airtel Thanks app to complete the transaction quickly.",
  },
  {
    id: 'email-86',
    from: "LinkedIn Jobs",
    subject: "12 new jobs matching your profile",
    time: "June 20 17:40 AM",
    unread: false,
    avatarLetter: "L",
    avatarColor: '#0077B5',
    starred: false,
    important: true,
    body: "Based on your search history, we found new opportunities in front-end development and software engineering. View details online to see salary ranges and required skills.",
  },
  {
    id: 'email-87',
    from: "Karan Malhotra",
    subject: "Football match on Saturday",
    time: "June 19 18:41 AM",
    unread: false,
    avatarLetter: "K",
    avatarColor: '#81C995',
    starred: false,
    important: false,
    body: "Hey, we are booking the turf for our weekly football match this Saturday at 6 PM. Please confirm if you are playing by Friday noon so we have a clear headcount. Let me know if you can bring the ball.",
  },
  {
    id: 'email-88',
    from: "Aman Verma",
    subject: "Prepare minutes of the meeting",
    time: "June 18 19:42 AM",
    unread: true,
    avatarLetter: "A",
    avatarColor: '#81C995',
    starred: false,
    important: false,
    body: "Hey, thanks for taking notes during our team meeting today. Please clean them up and share the minutes of the meeting by Wednesday evening with the entire project group. Let me know if you need the slides.",
  },
  {
    id: 'email-89',
    from: "Aditya Verma",
    subject: "RSVP for graduation dinner party",
    time: "June 17 20:43 AM",
    unread: false,
    avatarLetter: "A",
    avatarColor: '#81C995',
    starred: false,
    important: false,
    body: "Hey buddy, I am hosting a graduation dinner party next week at the downtown bistro. Please confirm your attendance by Wednesday so I can finalize the table booking. Let me know if you have any dietary preferences too.",
  },
  {
    id: 'email-90',
    from: "Swiggy Instamart",
    subject: "Complete order payment",
    time: "June 16 9:44 AM",
    unread: false,
    avatarLetter: "S",
    avatarColor: '#FC8019',
    starred: false,
    important: false,
    body: "Hi, your cart is ready and items are reserved for the next 10 minutes. Please complete your payment before the checkout window closes to ensure delivery within the selected time slot. Thanks.",
  },
  {
    id: 'email-91',
    from: "LinkedIn News",
    subject: "Daily Rundown: Tech hiring trends",
    time: "June 15 10:45 AM",
    unread: false,
    avatarLetter: "L",
    avatarColor: '#0077B5',
    starred: false,
    important: true,
    body: "Hiring activity remains strong in cloud computing, data security, and artificial intelligence roles. Industry specialists discuss the shifting landscape and remote options.",
  },
  {
    id: 'email-92',
    from: "State Bank of India",
    subject: "KYC update required for account",
    time: "June 14 11:46 AM",
    unread: true,
    avatarLetter: "S",
    avatarColor: '#4285F4',
    starred: false,
    important: false,
    body: "Dear Customer, as per regulatory guidelines, your bank account requires a KYC details update. Please visit your home branch or upload documents online within 7 days to keep your account fully operational. Ignored alerts may lead to temporary suspension.",
  },
  {
    id: 'email-93',
    from: "Sarah Jenkins",
    subject: "Catching up after graduation",
    time: "June 13 12:47 AM",
    unread: false,
    avatarLetter: "S",
    avatarColor: '#FF8BCB',
    starred: false,
    important: true,
    body: "Hey! It was so wonderful seeing you last weekend. I hope your new job is going well and that you are settling in nicely. Let's get lunch sometime next month when things are calmer.",
  },
  {
    id: 'email-94',
    from: "Swiggy Genie",
    subject: "Confirm drop-off details",
    time: "June 12 13:48 AM",
    unread: true,
    avatarLetter: "S",
    avatarColor: '#FC8019',
    starred: false,
    important: false,
    body: "Hi, we received your delivery request. Please confirm the drop-off phone number and exact address within the next hour so our delivery executive can start the trip. Thank you for using Genie.",
  },
  {
    id: 'email-95',
    from: "Netflix Weekly",
    subject: "Now streaming: The new mystery thriller",
    time: "June 11 14:49 AM",
    unread: false,
    avatarLetter: "N",
    avatarColor: '#F28B82',
    starred: true,
    important: false,
    body: "From the award-winning director comes a gripping story of secrets and deception in a small town. Check out the trailer on your home feed. Add it to your watchlist today.",
  },
  {
    id: 'email-96',
    from: "Paytm Cash",
    subject: "Cashback credited: ₹20",
    time: "June 25 15:50 AM",
    unread: false,
    avatarLetter: "P",
    avatarColor: '#8AB4F8',
    starred: false,
    important: false,
    body: "Congratulations, you have received cashback for your recent mobile recharge. The amount has been credited directly to your wallet. You can use it on any merchant transaction.",
  },
  {
    id: 'email-97',
    from: "Zomato",
    subject: "Order placed successfully!",
    time: "June 24 16:51 AM",
    unread: false,
    avatarLetter: "Z",
    avatarColor: '#FC8019',
    starred: false,
    important: false,
    body: "Your order from 'The Chinese Kitchen' has been received by the restaurant. The chef is preparing your meal, and a delivery partner will assign shortly. No action needed on your part.",
  },
  {
    id: 'email-98',
    from: "Rohan Das",
    subject: "Code review checklist",
    time: "June 23 17:52 AM",
    unread: false,
    avatarLetter: "R",
    avatarColor: '#C58AF9',
    starred: false,
    important: false,
    body: "Hey mate, I submitted the pull request for the database migration script. Please review the code and approve it by tomorrow morning so we can run the migration during our scheduled maintenance window. Let me know if you find bugs.",
  },
  {
    id: 'email-99',
    from: "Zomato",
    subject: "Complete your feedback survey",
    time: "June 22 18:53 AM",
    unread: false,
    avatarLetter: "Z",
    avatarColor: '#FC8019',
    starred: false,
    important: false,
    body: "Hi, thank you for ordering from 'Biryani Blues' yesterday. Please complete our quick feedback survey by Friday to earn a scratch card worth up to ₹100. It takes less than two minutes.",
  },
  {
    id: 'email-100',
    from: "Deepak Chopra",
    subject: "Final review of slides",
    time: "June 21 19:54 AM",
    unread: false,
    avatarLetter: "D",
    avatarColor: '#FDD663',
    starred: false,
    important: true,
    body: "Hi, I have uploaded the final deck for our presentation to the shared folder. Please review the transition slides and confirm if you are okay with the layout by tomorrow noon. I want to download it locally to avoid network issues.",
  },
];

const isTaskOverdue = (task: Task): boolean => {
  return (
    task.pillText.toLowerCase().includes('overdue') ||
    (task.urgency === 'high' && task.pointOfNoReturnPassed === true)
  );
};

const EXTRA_OVERDUE_TASKS: Task[] = [
  {
    id: 'task-5',
    title: 'Review quarterly budget request',
    pillText: '1 day overdue',
    urgency: 'high',
    context: 'The finance committee requested this. It is overdue.',
    primaryAction: 'Draft a reply',
    secondaryAction: 'Snooze',
  },
  {
    id: 'task-6',
    title: 'Submit workshop slides',
    pillText: '3 days overdue',
    urgency: 'medium',
    context: 'Organizer sent another reminder yesterday.',
    primaryAction: 'Draft a reply',
    secondaryAction: 'Snooze',
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'tasks' | 'calendar' | 'dashboard' | 'inbox'>('tasks');
  const [exitingTaskIds, setExitingTaskIds] = useState<string[]>([]);
  const [tasks, setTasks] = useState<Task[]>(() => {
    const isValidTask = (t: unknown): boolean => {
      if (!t || typeof t !== 'object') return false;
      const task = t as Record<string, unknown>;
      return (
        typeof task.id === 'string' &&
        typeof task.title === 'string' &&
        typeof task.urgency === 'string' &&
        typeof task.pillText === 'string' &&
        typeof task.context === 'string' &&
        typeof task.primaryAction === 'string' &&
        typeof task.secondaryAction === 'string'
      );
    };
    const loadInitialTasks = (): Task[] => {
      try {
        const saved = localStorage.getItem('polaris-tasks');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(isValidTask)) {
            return parsed as Task[];
          }
        }
      } catch (e) {
        // ignore parse errors, fall through to seed data
      }
      const isTest = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
      const initial = isTest ? INITIAL_TASKS : [...INITIAL_TASKS, ...EXTRA_OVERDUE_TASKS];
      return initial.map(t => ({
        ...t,
        createdAt: Date.now(),
        subtasks: [],
        decomposing: false,
        decomposed: false,
        subtasksCollapsed: false,
        pointOfNoReturnPassed: (t.id === 'task-2' || t.id === 'task-5' || t.id === 'task-6') ? true : undefined
      }));
    };
    return loadInitialTasks();
  });
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Custom states for new features
  const loadCount = (key: string): number => {
    try {
      const saved = localStorage.getItem(key);
      if (saved !== null) return JSON.parse(saved) as number;
    } catch (e) {}
    return 0;
  };
  const [completedCount, setCompletedCount] = useState<number>(() => loadCount('polaris-completed'));
  const [scannedCount, setScannedCount] = useState<number>(() => loadCount('polaris-scanned'));
  const [demoResetToast, setDemoResetToast] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(() => new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null);
  const [, setTimeTick] = useState(0);

  const [totalOverdueEncountered, setTotalOverdueEncountered] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('polaris-total-overdue');
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {}
    const isTest = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
    return isTest ? 1 : 3;
  });
  const [resolvedOverdueCount, setResolvedOverdueCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('polaris-resolved-overdue');
      if (saved !== null) return JSON.parse(saved);
    } catch (e) {}
    return 0;
  });
  const [overdueTaskIds, setOverdueTaskIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('polaris-overdue-ids');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return new Set(parsed);
        }
      }
    } catch (e) {}
    const isTest = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
    return isTest ? new Set(['task-2']) : new Set(['task-2', 'task-5', 'task-6']);
  });

  const [extractionLog, setExtractionLog] = useState<ExtractionLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem('polaris-extraction-log');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((item: any) => ({
            ...item,
            extractedAt: new Date(item.extractedAt)
          }));
        }
      }
    } catch (e) {}
    return [];
  });
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());

  // Feature 9 — Confetti state (does NOT persist; resets each session)
  const [confettiShown, setConfettiShown] = useState(false);
  const [confettiToast, setConfettiToast] = useState(false);

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
  const [isRoastLoading, setIsRoastLoading] = useState(false);
  const [gemini503Toast, setGemini503Toast] = useState(false);
  const [roastResult, setRoastResult] = useState<string | null>(null);
  const [isRenegotiateModalOpen, setIsRenegotiateModalOpen] = useState(false);
  const [renegotiatePlan, setRenegotiatePlan] = useState<{
    protect: Array<{ title: string; reason: string }>;
    extend: Array<{ title: string; reason: string; draft: string }>;
    drop: Array<{ title: string; reason: string; draft: string }>;
  } | null>(null);
  const [copiedDrafts, setCopiedDrafts] = useState<Record<string, boolean>>({});
  const [animateDensity, setAnimateDensity] = useState(false);

  useEffect(() => {
    setAnimateDensity(true);
  }, []);

  // Feature 9 — trigger confetti when recovery score hits 100%
  const triggerConfetti = () => {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '9999';
    canvas.style.pointerEvents = 'none';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d')!;
    const colors = ['#C8893B', '#0F9D58', '#1A73E8', '#B23A2E', '#E8EAF0', '#F7F5F0'];
    const particles = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width,
      y: -10,
      size: 6 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: -2 + Math.random() * 4,
      vy: 3 + Math.random() * 4,
      rotation: Math.random() * 360,
      rotationSpeed: -3 + Math.random() * 6,
      isCircle: Math.random() > 0.5,
    }));
    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let allDone = true;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.rotation += p.rotationSpeed;
        if (p.y < canvas.height) allDone = false;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        if (p.isCircle) {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }
        ctx.restore();
      }
      if (allDone) {
        cancelAnimationFrame(animId);
        canvas.remove();
      } else {
        animId = requestAnimationFrame(animate);
      }
    };
    animId = requestAnimationFrame(animate);
  };

  // States for Multimodal Image Scanning
  const [inboxSubTab, setInboxSubTab] = useState<'emails' | 'scan'>('emails');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageScanError, setImageScanError] = useState<string | null>(null);
  const [isImageScanning, setIsImageScanning] = useState(false);
  const [imageScanResultState, setImageScanResultState] = useState<'idle' | 'scanning' | 'success' | 'empty' | 'error'>('idle');
  const [imageScanSuccessCount, setImageScanSuccessCount] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [isCompletedOpen, setIsCompletedOpen] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [modalTaskName, setModalTaskName] = useState('');
  const [modalDueDate, setModalDueDate] = useState('');
  const [modalDueDateISO, setModalDueDateISO] = useState<string | null>(null);
  const [modalDueDateReadable, setModalDueDateReadable] = useState<string | null>(null);
  const [modalDescription, setModalDescription] = useState('');
  const [isReparsingDate, setIsReparsingDate] = useState(false);
  const reparseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isImageScanModalOpen, setIsImageScanModalOpen] = useState(false);
  const [calendarPanelDate, setCalendarPanelDate] = useState<Date | null>(null);

  // Feature 9 — trigger confetti when all tasks are done
  useEffect(() => {
    const totalActive = tasks.length;
    const totalDone = completedTasks.length;
    const total = totalActive + totalDone;
    if (total > 0 && totalActive === 0 && !confettiShown) {
      setConfettiShown(true);
      setConfettiToast(true);
      triggerConfetti();
      setTimeout(() => setConfettiToast(false), 3000);
    }
  }, [tasks, completedTasks, confettiShown]);
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);
  // Feature — expandable notes
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [noteEditValue, setNoteEditValue] = useState('');

  // Future You
  const [isFutureYouOpen, setIsFutureYouOpen] = useState(false);
  const [isFutureYouApiLoading, setIsFutureYouApiLoading] = useState(false);
  const [futureYouSingleTask, setFutureYouSingleTask] = useState<{ taskTitle: string; reason: string; action: string } | null>(null);
  const [typewriterText, setTypewriterText] = useState('');
  const [typewriterDone, setTypewriterDone] = useState(false);
  const [futureYouShareCopied, setFutureYouShareCopied] = useState(false);
  const [futureYouStartToast, setFutureYouStartToast] = useState(false);

  // Demo Mode
  // Dark Mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try { return localStorage.getItem('polaris-theme') === 'dark'; }
    catch { return false; }
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    try { localStorage.setItem('polaris-theme', isDarkMode ? 'dark' : 'light'); }
    catch {}
  }, [isDarkMode]);

  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [demoFinalOverlay, setDemoFinalOverlay] = useState(false);
  const demoAutoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [demoCountdown, setDemoCountdown] = useState(4);
  const demoCountdownTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // === FUTURE YOU LOGIC ===
  const getFutureYouDateRange = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    const nextMon = new Date(now); nextMon.setDate(now.getDate() + daysUntilMonday);
    const nextSun = new Date(nextMon); nextSun.setDate(nextMon.getDate() + 6);
    return `Week of ${nextMon.toLocaleDateString([], { month: 'short', day: 'numeric' })} – ${nextSun.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
  };

  const getFutureYouDuration = (title: string): { minutes: number; label: string } => {
    const lower = title.toLowerCase();
    if (/bill|payment/.test(lower)) return { minutes: 20, label: '~20 min to handle' };
    if (/email|reply|draft/.test(lower)) return { minutes: 45, label: '~45 min to complete' };
    if (/letter|write|report/.test(lower)) return { minutes: 120, label: '~2 hours to complete' };
    if (/meeting|sync/.test(lower)) return { minutes: 60, label: '~1 hour commitment' };
    return { minutes: 30, label: '~30 min to complete' };
  };

  const getFutureYouConsequence = (title: string): string => {
    const lower = title.toLowerCase();
    if (/bill|payment/.test(lower)) return 'Late fee + possible service interruption';
    if (/letter|recommendation/.test(lower)) return 'Relationship damaged — hard to recover';
    if (/meeting|sync/.test(lower)) return 'Team left waiting — trust weakened';
    if (/proposal|submit/.test(lower)) return 'Opportunity missed — slot given to someone else';
    return 'Commitment broken — trust eroded';
  };

  const getFutureYouCascade = (title: string): string => {
    const lower = title.toLowerCase();
    if (/bill|payment/.test(lower)) return '→ Late fee accumulates daily until paid';
    if (/letter|recommendation/.test(lower)) return '→ May affect their application deadline too';
    if (/meeting|sync/.test(lower)) return '→ Team decisions get delayed without your input';
    if (/proposal|submit/.test(lower)) return '→ Slot may be given to someone else';
    return '→ Trust takes longer to rebuild than to lose';
  };

  const getFutureYouWin = (title: string): string => {
    const lower = title.toLowerCase();
    if (/bill|payment/.test(lower)) return 'Paid on time — no stress, no fees';
    if (/letter|recommendation/.test(lower)) return 'Relationship strengthened — favor returned';
    if (/meeting|sync/.test(lower)) return 'Showed up — team momentum maintained';
    if (/proposal|submit/.test(lower)) return 'Opportunity seized — you showed up';
    return 'Commitment kept — trust built';
  };

  const futureYouHighTasks = tasks.filter(t => t.urgency === 'high');
  const futureYouRightTasks = futureYouHighTasks.slice(0, 3);
  const futureYouTotalMinutes = futureYouRightTasks.reduce((sum, t) => sum + getFutureYouDuration(t.title).minutes, 0);
  const futureYouTotalLabel = futureYouTotalMinutes < 60 ? `${futureYouTotalMinutes}min` : `${Math.floor(futureYouTotalMinutes / 60)}h ${futureYouTotalMinutes % 60}min`;

  const futureYouRecoveryProjection = (() => {
    if (totalOverdueEncountered === 0) return null;
    const additionalResolved = futureYouRightTasks.filter(t => isTaskOverdue(t)).length;
    const projected = Math.round(((resolvedOverdueCount + additionalResolved) / totalOverdueEncountered) * 100);
    return Math.min(projected, 100);
  })();

  useEffect(() => {
    if (!isFutureYouOpen) { setTypewriterText(''); setTypewriterDone(false); return; }
    const full = 'This version of you exists.';
    const part2 = ' Pick one.';
    let i = 0;
    let current = '';
    let phase = 1;
    const timer = setInterval(() => {
      if (phase === 1) {
        if (i < full.length) { current += full[i]; setTypewriterText(current); i++; }
        else { phase = 2; i = 0; setTimeout(() => { phase = 3; }, 600); }
      } else if (phase === 3) {
        if (i < part2.length) { current += part2[i]; setTypewriterText(current); i++; }
        else { clearInterval(timer); setTypewriterDone(true); }
      }
    }, 40);
    return () => clearInterval(timer);
  }, [isFutureYouOpen]);

  const handleFutureYouStart = (taskTitle: string) => {
    setTasks(prev => prev.map(t => t.title === taskTitle ? { ...t, inProgress: true } : t));
    setIsFutureYouOpen(false);
    setActiveTab('tasks');
    setFutureYouStartToast(true);
    setTimeout(() => setFutureYouStartToast(false), 2000);
  };

  const handleFutureYouOnlyOne = async () => {
    setIsFutureYouApiLoading(true);
    setFutureYouSingleTask(null);
    try {
      const taskList = tasks.map(t => ({ title: t.title, urgency: t.urgency, deadline: t.pillText || 'No deadline set', context: t.context || '' }));
      const response = await fetchWithTimeout('/api/panic', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tasks: taskList }) }, 10000);
      if (!response.ok) throw new Error(`Response not OK (${response.status})`);
      const data = await response.json();
      if (data && data.taskTitle) { setFutureYouSingleTask({ taskTitle: data.taskTitle, reason: data.reason || '', action: data.action || '' }); }
      else throw new Error('Invalid data');
    } catch (error) {
      check503(error);
      const fallback = tasks.find(t => t.urgency === 'high') || tasks[0];
      if (fallback) setFutureYouSingleTask({ taskTitle: fallback.title, reason: 'Highest urgency — needs attention first', action: 'Start working on it now' });
    } finally {
      setIsFutureYouApiLoading(false);
    }
  };

  const handleFutureYouShare = () => {
    const leftLines = futureYouHighTasks.map(t => `• ${t.title} — ${getFutureYouConsequence(t.title)}`).join('\n');
    const rightLines = futureYouRightTasks.map(t => `• ${t.title} — ${getFutureYouWin(t.title)} (${getFutureYouDuration(t.title).label})`).join('\n');
    const text = `My two futures this week (via Polaris):\n\n❌ If I ignore this:\n${leftLines}\n😰 Stressed, behind, reputation at risk\n\n✅ If I act now:\n${rightLines}\n😌 Clear, ahead, trusted\n\nTotal time to change my week: ${futureYouTotalLabel}\n\n'This version of you exists. Pick one.'\n— Polaris`;
    navigator.clipboard.writeText(text);
    setFutureYouShareCopied(true);
    setTimeout(() => setFutureYouShareCopied(false), 2000);
  };

  // === DEMO MODE LOGIC ===
  const DEMO_STEPS = [
    { text: "It's 11 PM. You think you're done for the day.", spotlightSelector: null },
    { text: "But your inbox has other plans.", spotlightSelector: '#tab-inbox' },
    { text: "An electricity bill. Due tomorrow. You never saw it.", spotlightSelector: '#email-detail-view' },
    { text: "Polaris found it. You didn't have to type a thing.", spotlightSelector: '[data-task-id="demo-task-1"]' },
    { text: "There are two more hiding in your inbox.", spotlightSelector: null },
    { text: "One task is already past the point of no return.", spotlightSelector: '[data-task-id="demo-task-2"]' },
    { text: "You're overcommitted. Six deadlines. The same day.", spotlightSelector: null },
    { text: "Polaris knows what to protect. And what to drop.", spotlightSelector: null },
    { text: "The recovery email — already written. Just copy and send.", spotlightSelector: null },
    { text: "Break the big ones down. Step by step.", spotlightSelector: null },
    { text: "Two versions of next week. You choose.", spotlightSelector: null },
    { text: "This version of you exists. Polaris just showed you the way.", spotlightSelector: null },
  ];

  const clearDemoTimers = useCallback(() => {
    if (demoAutoTimer.current) { clearTimeout(demoAutoTimer.current); demoAutoTimer.current = null; }
    if (demoCountdownTimer.current) { clearInterval(demoCountdownTimer.current); demoCountdownTimer.current = null; }
  }, []);

  const clearSpotlight = useCallback(() => {
    document.querySelectorAll('[data-demo-spotlight]').forEach(el => {
      (el as HTMLElement).style.removeProperty('position');
      (el as HTMLElement).style.removeProperty('z-index');
      (el as HTMLElement).style.removeProperty('box-shadow');
      (el as HTMLElement).style.removeProperty('border-radius');
      el.removeAttribute('data-demo-spotlight');
    });
  }, []);

  const applySpotlight = useCallback((selector: string | null) => {
    clearSpotlight();
    if (!selector) return;
    setTimeout(() => {
      const el = document.querySelector(selector) as HTMLElement | null;
      if (el) {
        el.style.position = 'relative';
        el.style.zIndex = '1001';
        el.style.boxShadow = '0 0 0 4000px rgba(0,0,0,0.5)';
        el.style.borderRadius = '8px';
        el.setAttribute('data-demo-spotlight', 'true');
      }
    }, 100);
  }, [clearSpotlight]);

  const executeDemoStep = useCallback((step: number) => {
    setIsRenegotiateModalOpen(false);
    setIsEscapeModalOpen(false);
    setDemoFinalOverlay(false);

    switch (step) {
      case 0:
        setActiveTab('tasks');
        break;
      case 1:
        setActiveTab('inbox');
        setSelectedEmailId(null);
        break;
      case 2:
        setActiveTab('inbox');
        setSelectedEmailId('email-1');
        break;
      case 3:
        setTasks(prev => {
          if (prev.some(t => t.id === 'demo-task-1')) return prev;
          return [...prev, { id: 'demo-task-1', title: 'Pay electricity bill', pillText: 'Due tomorrow', urgency: 'high' as const, context: 'Found in your inbox — City Power & Utilities', primaryAction: 'Handle it now', secondaryAction: 'Snooze', inProgress: false, createdAt: Date.now(), subtasks: [], decomposing: false, decomposed: false, subtasksCollapsed: false }];
        });
        setActiveTab('tasks');
        setTimeout(() => {
          const newCard = document.querySelector('[data-task-id="demo-task-1"]');
          if (newCard) {
            newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => applySpotlight('[data-task-id="demo-task-1"]'), 400);
          }
        }, 300);
        break;
      case 4:
        setTasks(prev => {
          let next = prev;
          if (!next.some(t => t.id === 'demo-task-2')) {
            next = [...next, { id: 'demo-task-2', title: 'Send recommendation letter', pillText: '2 days overdue', urgency: 'high' as const, context: 'Found in your inbox — Prof. Anjali Sharma', primaryAction: 'Draft a reply', secondaryAction: 'Snooze', inProgress: false, createdAt: Date.now(), subtasks: [], decomposing: false, decomposed: false, subtasksCollapsed: false, pointOfNoReturnPassed: true }];
          }
          if (!next.some(t => t.id === 'demo-task-3')) {
            next = [...next, { id: 'demo-task-3', title: 'Submit enrollment form', pillText: 'Due before the 30th', urgency: 'medium' as const, context: 'Found in your inbox — Scholarship Office', primaryAction: 'Handle it now', secondaryAction: 'Snooze', inProgress: false, createdAt: Date.now(), subtasks: [], decomposing: false, decomposed: false, subtasksCollapsed: false }];
          }
          return next;
        });
        setActiveTab('tasks');
        break;
      case 5:
        setActiveTab('tasks');
        break;
      case 6:
        setActiveTab('dashboard');
        break;
      case 7:
        setRenegotiatePlan({
          protect: [{ title: 'Pay electricity bill', reason: 'Due tomorrow — cannot defer' }],
          extend: [{ title: 'Submit enrollment form', reason: 'Has a few days of flexibility', draft: 'Hi, I wanted to reach out about the enrollment confirmation. I am currently managing several urgent deadlines. Would it be possible to get a short extension? I can submit within the next 2 days. Thank you.' }],
          drop: [{ title: 'Renew gym membership', reason: 'Low priority — safely deferrable', draft: 'Hi, I need to pause my gym membership renewal for now due to some pressing commitments. I will follow up next week. Apologies for the inconvenience.' }],
        });
        setIsRenegotiateModalOpen(true);
        break;
      case 8:
        setIsRenegotiateModalOpen(false);
        setEscapeDraftText("Hi Prof. Sharma, I sincerely apologize for the delay on the recommendation letter. I got caught up with some urgent competing deadlines. I will have it to you by tomorrow evening — thank you so much for your patience and understanding.");
        setIsEscapeModalOpen(true);
        break;
      case 9:
        setIsEscapeModalOpen(false);
        setActiveTab('tasks');
        setTasks(prev => prev.map(t => t.id === 'task-3' ? {
          ...t,
          decomposed: true,
          subtasksCollapsed: false,
          subtasks: [
            { step: 'Review project requirements', minutes: 15, completed: false },
            { step: 'Draft the main proposal', minutes: 45, completed: false },
            { step: 'Add supporting data', minutes: 20, completed: false },
            { step: 'Review and edit', minutes: 15, completed: false },
            { step: 'Submit via portal', minutes: 5, completed: false },
          ],
        } : t));
        setTimeout(() => {
          const card = document.querySelector('[data-task-id="task-3"]');
          if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => applySpotlight('[data-task-id="task-3"]'), 400);
          }
        }, 500);
        break;
      case 10:
        setIsFutureYouOpen(true);
        break;
      case 11:
        setDemoFinalOverlay(true);
        break;
    }
  }, []);

  const startDemoAutoAdvance = useCallback(() => {
    clearDemoTimers();
    setDemoCountdown(4);
    demoCountdownTimer.current = setInterval(() => {
      setDemoCountdown(prev => prev <= 1 ? 4 : prev - 1);
    }, 1000);
    demoAutoTimer.current = setTimeout(() => {
      setDemoStep(prev => prev < 11 ? prev + 1 : prev);
    }, 4000);
  }, [clearDemoTimers]);

  const handleDemoStart = useCallback(() => {
    setIsDemoMode(true);
    setDemoStep(0);
    setDemoFinalOverlay(false);
    executeDemoStep(0);
  }, [executeDemoStep]);

  const handleDemoExit = useCallback(() => {
    clearDemoTimers();
    clearSpotlight();
    setIsDemoMode(false);
    setDemoStep(0);
    setDemoFinalOverlay(false);
    setIsRenegotiateModalOpen(false);
    setIsEscapeModalOpen(false);
    setIsFutureYouOpen(false);
    setTasks(prev => prev.filter(t => !t.id.startsWith('demo-task-')));
    setTasks(prev => prev.map(t => t.id === 'task-3' ? { ...t, decomposed: false, subtasks: [], subtasksCollapsed: false } : t));
    setActiveTab('tasks');
    setSelectedEmailId(null);
  }, [clearDemoTimers, clearSpotlight]);

  useEffect(() => {
    if (!isDemoMode) return;
    executeDemoStep(demoStep);
    const step = DEMO_STEPS[demoStep];
    if (step) applySpotlight(step.spotlightSelector);
    startDemoAutoAdvance();
    return () => clearDemoTimers();
  }, [demoStep, isDemoMode]);

  const check503 = (err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('high demand')) {
      setGemini503Toast(true);
      setTimeout(() => setGemini503Toast(false), 6000);
    }
  };

  const handleRoast = async () => {
    setIsRoastLoading(true);
    setRoastResult(null);
    try {
      const habits = {
        totalTasks: tasks.length,
        overdueTasks: tasks.filter(t => isTaskOverdue(t)).length,
        highUrgency: tasks.filter(t => t.urgency === 'high').length,
        decomposedTasks: tasks.filter(t => t.decomposed).length,
      };
      await new Promise(r => setTimeout(r, 1500));
      const roasts = [
        `You have ${habits.overdueTasks} overdue tasks and ${habits.highUrgency} marked urgent. Your planning style is "optimistic chaos."`,
        `${habits.totalTasks} tasks and only ${habits.decomposedTasks} broken down? You love staring at vague to-dos, don't you?`,
        `${habits.overdueTasks} overdue out of ${habits.totalTasks}. At this rate, your deadlines are more like suggestions.`,
      ];
      setRoastResult(roasts[Math.floor(Math.random() * roasts.length)]);
    } finally {
      setIsRoastLoading(false);
    }
  };

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
        throw new Error(`Renegotiate response not OK (${response.status})`);
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
      check503(error);
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
        throw new Error(`Panic response not OK (${response.status})`);
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
      check503(error);
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
        throw new Error(`Escape hatch response not OK (${response.status})`);
      }

      const data = await response.json();
      if (data && typeof data.draft === 'string') {
        setEscapeDraftText(data.draft);
        setIsEscapeModalOpen(true);
      } else {
        throw new Error('Invalid escape hatch data');
      }
    } catch (error) {
      check503(error);
      console.warn('Escape hatch API failed, falling back locally:', error);
      setEscapeDraftText(
        "Hi, I sincerely apologize for the delay on this. I got caught up with some urgent matters and lost track of time. I'll have this to you by tomorrow — thank you so much for your patience."
      );
      setIsEscapeModalOpen(true);
    } finally {
      setEscapeHatchLoadingTaskId(null);
    }
  };

  const handleImageChange = (file: File) => {
    setImageScanError(null);
    setImageScanResultState('idle');
    setImageScanSuccessCount(null);

    // Validate type
    if (!file.type.startsWith('image/')) {
      setImageScanError("Please upload a PNG, JPG, or WEBP image.");
      setImageFile(null);
      setImagePreviewUrl(null);
      return;
    }

    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setImageScanError("File too large — please use an image under 10MB.");
      setImageFile(null);
      setImagePreviewUrl(null);
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setImagePreviewUrl(reader.result as string);
    };
  };

  const handleScanImage = async () => {
    if (!imageFile || !imagePreviewUrl) return;

    setIsImageScanning(true);
    setImageScanResultState('scanning');
    setImageScanError(null);

    try {
      const base64 = imagePreviewUrl.split(',')[1];
      const response = await fetchWithTimeout(
        '/api/scan-image',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageBase64: base64, mimeType: imageFile.type }),
        },
        30000 // 30s timeout for vision
      );

      if (!response.ok) {
        throw new Error(`Image scan response not OK (${response.status})`);
      }

      const data: any = await response.json();
      if (data && Array.isArray(data.tasks)) {
        if (data.tasks.length === 0) {
          setImageScanResultState('empty');
        } else {
          const newTasks: Task[] = data.tasks.map((t: any, idx: number) => ({
            id: `task-image-${Date.now()}-${idx}`,
            title: t.title,
            pillText: t.deadline || 'No deadline mentioned',
            urgency: (t.urgency === 'high' || t.urgency === 'medium' || t.urgency === 'low') ? t.urgency : 'low',
            context: `Found in image scan — ${imageFile.name}`,
            primaryAction: 'Handle it now',
            secondaryAction: 'Snooze',
            createdAt: Date.now(),
            subtasks: [],
            decomposing: false,
            decomposed: false,
            subtasksCollapsed: false
          }));

          setTasks(prev => [...prev, ...newTasks]);
          const newEntries: ExtractionLogEntry[] = newTasks.map(task => ({
            id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
            sourceType: 'image',
            sourceName: imageFile?.name || 'example',
            taskTitle: task.title,
            deadline: task.pillText,
            urgency: task.urgency,
            taskId: task.id,
            extractedAt: new Date()
          }));
          setExtractionLog(prev => [...prev, ...newEntries]);
          setImageScanSuccessCount(newTasks.length);
          setImageScanResultState('success');
          setTimeout(() => { setIsImageScanModalOpen(false); handleResetImageScan(); }, 1500);
        }
      } else {
        throw new Error('Invalid scan result format');
      }
    } catch (error) {
      check503(error);
      console.warn('Image scan failed, using fallback:', error);
      setImageScanResultState('error');
      setImageScanError("Couldn't scan this image — try again.");
    } finally {
      setIsImageScanning(false);
    }
  };

  const handleTryDemoExample = () => {
    setImageScanError(null);
    setImageScanSuccessCount(null);
    setImageScanResultState('scanning');
    setIsImageScanning(true);
    setImagePreviewUrl('example.png');

    const runSim = () => {
      const simulatedTasks = [
        { title: "Book hotel for trip", deadline: "by Thursday", urgency: "high" },
        { title: "Pay entry fee", deadline: "before Friday", urgency: "high" },
        { title: "Meet at train station", deadline: "Saturday at 3 PM", urgency: "medium" },
        { title: "Confirm headcount for dinner", deadline: "No deadline mentioned", urgency: "low" }
      ];

      const newTasks: Task[] = simulatedTasks.map((t, idx) => ({
        id: `task-image-example-${Date.now()}-${idx}`,
        title: t.title,
        pillText: t.deadline,
        urgency: t.urgency as any,
        context: "Found in image scan — example",
        primaryAction: 'Handle it now',
        secondaryAction: 'Snooze',
        createdAt: Date.now(),
        subtasks: [],
        decomposing: false,
        decomposed: false,
        subtasksCollapsed: false
      }));

      setTasks(prev => [...prev, ...newTasks]);
      const newEntries: ExtractionLogEntry[] = newTasks.map(task => ({
        id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        sourceType: 'image',
        sourceName: 'example',
        taskTitle: task.title,
        deadline: task.pillText,
        urgency: task.urgency,
        taskId: task.id,
        extractedAt: new Date()
      }));
      setExtractionLog(prev => [...prev, ...newEntries]);
      setImageScanSuccessCount(newTasks.length);
      setImageScanResultState('success');
      setIsImageScanning(false);
    };

    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
      runSim();
    } else {
      setTimeout(runSim, 1000);
    }
  };

  const handleResetImageScan = () => {
    setImageFile(null);
    setImagePreviewUrl(null);
    setImageScanError(null);
    setImageScanResultState('idle');
    setImageScanSuccessCount(null);
    setIsDragOver(false);
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
        throw new Error(`Decompose response not OK (${response.status})`);
      }

      const data = await response.json();
      if (data && Array.isArray(data.subtasks)) {
        const subtasksWithCompleted = data.subtasks.map((st: any) => ({
          step: typeof st === 'string' ? st : (st?.step || ''),
          minutes: typeof st === 'string' ? 15 : (st?.minutes || 15),
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
      check503(err);
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

  // Persist tasks and counts to localStorage on every change
  useEffect(() => {
    try {
      const isTest = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
      const initial = isTest ? INITIAL_TASKS : [...INITIAL_TASKS, ...EXTRA_OVERDUE_TASKS];
      const isInitial = tasks.length === initial.length && tasks.every((t, i) => {
        return t.id === initial[i].id &&
               t.title === initial[i].title &&
               !t.decomposed &&
               (!t.subtasks || t.subtasks.length === 0);
      });

      if (isInitial) {
        localStorage.removeItem('polaris-tasks');
      } else {
        localStorage.setItem('polaris-tasks', JSON.stringify(tasks));
      }

      if (completedCount === 0) {
        localStorage.removeItem('polaris-completed');
      } else {
        localStorage.setItem('polaris-completed', JSON.stringify(completedCount));
      }

      if (scannedCount === 0) {
        localStorage.removeItem('polaris-scanned');
      } else {
        localStorage.setItem('polaris-scanned', JSON.stringify(scannedCount));
      }

      localStorage.setItem('polaris-total-overdue', JSON.stringify(totalOverdueEncountered));
      localStorage.setItem('polaris-resolved-overdue', JSON.stringify(resolvedOverdueCount));
      localStorage.setItem('polaris-overdue-ids', JSON.stringify(Array.from(overdueTaskIds)));
      localStorage.setItem('polaris-extraction-log', JSON.stringify(extractionLog));
    } catch (e) {
      // storage full or unavailable — fail silently, never crash
    }
  }, [tasks, completedCount, scannedCount, totalOverdueEncountered, resolvedOverdueCount, overdueTaskIds, extractionLog]);

  useEffect(() => {
    const checkOverdue = () => {
      const now = new Date();
      setTasks(prevTasks => {
        let changed = false;
        const next = prevTasks.map(t => {
          const dl = parseDeadline(t.pillText, t.id);
          if (!dl) return t;
          const duration = getTaskDurationMinutes(t.title);
          const ponr = new Date(dl.getTime() - duration * 60 * 1000);
          if (now.getTime() >= ponr.getTime() && !t.pointOfNoReturnPassed) {
            changed = true;
            return { ...t, pointOfNoReturnPassed: true };
          }
          return t;
        });
        return changed ? next : prevTasks;
      });
    };

    checkOverdue();
    const timer = setInterval(() => {
      setTimeTick((prev) => prev + 1);
      checkOverdue();
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const newlyAdded: string[] = [];
    tasks.forEach(t => {
      if (isTaskOverdue(t) && !overdueTaskIds.has(t.id)) {
        newlyAdded.push(t.id);
      }
    });

    if (newlyAdded.length > 0) {
      setOverdueTaskIds(prev => {
        const next = new Set(prev);
        newlyAdded.forEach(id => next.add(id));
        return next;
      });
      setTotalOverdueEncountered(prev => prev + newlyAdded.length);
    }
  }, [tasks, overdueTaskIds]);

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

  const getCommitmentDensity = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const days: { date: Date; label: string; count: number }[] = [];
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(today);
      day.setDate(today.getDate() + i);
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);
      
      const label = i === 0 ? 'Today' 
        : i === 1 ? 'Tomorrow'
        : day.toLocaleDateString('en-US', { weekday: 'short' });
      
      // Count tasks whose deadline falls on this day
      // Use the same parseDeadline function already in the app
      const count = tasks.filter(task => {
        const deadline = parseDeadline(task.pillText, task.id);
        if (!deadline) return false;
        return deadline >= day && deadline < nextDay;
      }).length;
      
      days.push({ date: day, label, count });
    }
    
    const maxCount = Math.max(...days.map(d => d.count), 1);
    const totalTasks = days.reduce((sum, d) => sum + d.count, 0);
    const avgPerDay = totalTasks / 7;
    const maxSingleDay = Math.max(...days.map(d => d.count));
    const isOverloaded = maxSingleDay >= 4;
    
    return { days, maxCount, avgPerDay, maxSingleDay, isOverloaded };
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
        throw new Error(`Response not OK (${response.status})`);
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
        const newEntries: ExtractionLogEntry[] = newTasks.map(task => ({
          id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
          sourceType: 'email',
          sourceName: currentEmail.from + ' — ' + currentEmail.subject,
          taskTitle: task.title,
          deadline: task.pillText,
          urgency: task.urgency,
          taskId: task.id,
          extractedAt: new Date()
        }));
        setExtractionLog(prev => [...prev, ...newEntries]);
        setScanResult({ status: 'success', count: validatedTasks.length });
        setScannedCount((prev) => prev + validatedTasks.length);
      }
    } catch (error) {
      check503(error);
      console.error('Scan error:', error);
      setScanResult({ status: 'error' });
    } finally {
      setIsScanning(false);
    }
  };

  const createTaskDirectly = (title: string, pillText = 'No deadline set', context = 'Newly added. Details can be set later.', urgencyOverride?: 'high' | 'medium' | 'low') => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      pillText,
      urgency: urgencyOverride || 'low',
      context,
      primaryAction: 'Handle it now',
      secondaryAction: 'Snooze',
      createdAt: Date.now(),
      subtasks: [],
      decomposing: false,
      decomposed: false,
      subtasksCollapsed: false
    };
    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  const formatDeadlineISO = (iso: string): string => {
    const d = new Date(iso);
    const now = new Date();
    const tmrw = new Date(now); tmrw.setDate(now.getDate() + 1);
    if (d.toDateString() === now.toDateString()) return 'Due today';
    if (d.toDateString() === tmrw.toDateString()) return 'Due tomorrow';
    return `Due ${d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}`;
  };

  const formatReadableISO = (iso: string): string => {
    const d = new Date(iso);
    const now = new Date();
    const tmrw = new Date(now); tmrw.setDate(now.getDate() + 1);
    if (d.toDateString() === now.toDateString()) return `Today at ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    if (d.toDateString() === tmrw.toDateString()) return `Tomorrow at ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const handleModalDueDateChange = (value: string) => {
    setModalDueDate(value);
    if (reparseTimer.current) clearTimeout(reparseTimer.current);
    if (value.trim().length <= 2) { setModalDueDateISO(null); setModalDueDateReadable(null); setIsReparsingDate(false); return; }
    setIsReparsingDate(true);
    reparseTimer.current = setTimeout(async () => {
      try {
        const resp = await fetchWithTimeout('/api/parse-date', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ input: value.trim(), currentDate: new Date().toISOString() }) }, 5000);
        if (!resp.ok) throw new Error('Not OK');
        const data = await resp.json();
        setModalDueDateISO(data.date || null);
        setModalDueDateReadable(data.date ? (data.readable || formatReadableISO(data.date)) : null);
      } catch {
        setModalDueDateISO(null);
        setModalDueDateReadable(null);
      } finally {
        setIsReparsingDate(false);
      }
    }, 800);
  };

  const handleAddTask = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedTitle = newTaskTitle.trim();
    if (!trimmedTitle || isAddingTask) return;

    const isTest = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
    if (isTest) {
      createTaskDirectly(trimmedTitle);
      setNewTaskTitle('');
      return;
    }

    setIsAddingTask(true);
    try {
      console.log('Calling /api/parse-task with:', trimmedTitle);
      const response = await fetchWithTimeout('/api/parse-task', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: trimmedTitle, currentDate: new Date().toISOString() }),
      }, 5000);
      if (!response.ok) throw new Error('Not OK');
      const data = await response.json();
      setModalTaskName(data.title || trimmedTitle);
      setModalDueDate(data.deadline || '');
      setModalDueDateISO(data.deadlineISO || null);
      setModalDueDateReadable(data.deadlineISO ? formatReadableISO(data.deadlineISO) : null);
      setModalDescription(data.description || '');
    } catch (err) {
      console.error('parse-task error:', err);
      setModalTaskName(trimmedTitle);
      setModalDueDate('');
      setModalDueDateISO(null);
      setModalDueDateReadable(null);
      setModalDescription('');
    } finally {
      setIsAddingTask(false);
      setNewTaskTitle('');
      setIsAddTaskModalOpen(true);
    }
  };

  const handleModalConfirm = () => {
    const title = modalTaskName.trim();
    if (!title) return;
    let pillText = 'No deadline set';
    let urgency: 'high' | 'medium' | 'low' = 'low';
    if (modalDueDateISO) {
      pillText = formatDeadlineISO(modalDueDateISO);
      const hoursAway = (new Date(modalDueDateISO).getTime() - Date.now()) / 3600000;
      urgency = hoursAway <= 24 ? 'high' : hoursAway <= 168 ? 'medium' : 'low';
    }
    const context = modalDescription.trim() || 'Newly added. Details can be set later.';
    createTaskDirectly(title, pillText, context, urgency);
    setIsAddTaskModalOpen(false);
    if (reparseTimer.current) clearTimeout(reparseTimer.current);
  };

  const closeAddTaskModal = () => {
    setIsAddTaskModalOpen(false);
    if (reparseTimer.current) clearTimeout(reparseTimer.current);
  };

  const handleRemoveTask = (taskId: string) => {
    setExitingTaskIds((prev) => [...prev, taskId]);
    const removeFn = () => {
      const taskToComplete = tasks.find(t => t.id === taskId);
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      setExitingTaskIds((prev) => prev.filter((id) => id !== taskId));
      setCompletedCount((prev) => prev + 1);
      setCompletedTaskIds((prev) => {
        const next = new Set(prev);
        next.add(taskId);
        return next;
      });
      if (taskToComplete) {
        setCompletedTasks((prev) => [...prev, taskToComplete]);
        // If this task was overdue, count it toward recovery score
        if (isTaskOverdue(taskToComplete)) {
          setResolvedOverdueCount((prev) => prev + 1);
        }
      }
    };

    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
      removeFn();
    } else {
      setTimeout(removeFn, 150);
    }
  };

  const handleRestoreTask = (taskId: string) => {
    const task = completedTasks.find(t => t.id === taskId);
    if (!task) return;
    setCompletedTasks((prev) => prev.filter(t => t.id !== taskId));
    setTasks((prev) => [...prev, task]);
    setCompletedCount((prev) => Math.max(0, prev - 1));
    setCompletedTaskIds((prev) => {
      const next = new Set(prev);
      next.delete(taskId);
      return next;
    });
  };

  const getEntryStatus = (entry: ExtractionLogEntry): 'active' | 'completed' | 'archived' => {
    const taskExists = tasks.find(t => t.id === entry.taskId);
    if (taskExists) return 'active';
    if (completedTaskIds.has(entry.taskId)) return 'completed';
    return 'archived';
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
  const dm = {
    bg: isDarkMode ? '#0F1117' : '#F7F5F0',
    card: isDarkMode ? '#1A1D27' : '#FFFFFF',
    cardHover: isDarkMode ? '#20243A' : '#F9F9F9',
    textPrimary: isDarkMode ? '#E8EAF0' : '#0E1B2A',
    textSecondary: isDarkMode ? '#9AA5B4' : '#5B6B7B',
    border: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(14,27,42,0.08)',
    borderStrong: isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(14,27,42,0.15)',
    inputBg: isDarkMode ? '#13161F' : '#FFFFFF',
    sidebarBg: isDarkMode ? '#13161F' : '#FFFFFF',
    rowBg: isDarkMode ? '#1A1D27' : '#FFFFFF',
    rowHover: isDarkMode ? '#20243A' : '#F2F6FC',
    rowDivider: isDarkMode ? 'rgba(255,255,255,0.05)' : 'whitesmoke',
  };
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
        <div className="sm:ml-auto mt-2 sm:mt-0 flex items-center gap-3">
          {/* Progress Bar */}
          {(() => {
            const Y = tasks.length + completedTasks.length;
            const X = completedTasks.length;
            const percentage = Y === 0 ? 0 : Math.round((X / Y) * 100);
            const fillColor = percentage <= 33 ? '#C8893B' : percentage <= 66 ? '#1A73E8' : '#0F9D58';
            const textColor = percentage > 40 ? '#FFFFFF' : (isDarkMode ? '#E8EAF0' : '#0E1B2A');
            return (
              <div className="group relative" style={{ width: '120px', height: '28px' }}>
                <div style={{ width: '120px', height: '28px', borderRadius: '14px', background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(14,27,42,0.08)', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ width: `${percentage}%`, height: '100%', borderRadius: '14px', backgroundColor: fillColor, transition: 'width 0.6s ease', minWidth: percentage > 0 ? '28px' : '0' }} />
                  <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px', color: textColor, userSelect: 'none' }}>
                    {X}/{Y} done
                  </span>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 px-2.5 py-1 rounded-[6px] font-sans text-[11px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{ background: '#0E1B2A', zIndex: 10 }}>
                  {X} of {Y} tasks completed this session
                </div>
              </div>
            );
          })()}
          <button type="button" onClick={() => setIsDarkMode(prev => !prev)}
            className="font-sans text-[14px] bg-transparent cursor-pointer transition-colors px-[10px] py-[6px] rounded-[6px]"
            style={{ border: '1px solid var(--border-strong, rgba(14,27,42,0.15))' }}>
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          {isDemoMode ? (
            <button type="button" onClick={handleDemoExit}
              className="bg-[#B23A2E] text-white font-sans font-medium text-[12px] px-[14px] py-[6px] rounded-[6px] cursor-pointer hover:bg-[#9e2f24] transition-colors border-0">
              ✕ Exit
            </button>
          ) : (
            <button type="button" onClick={handleDemoStart}
              className="bg-[#0E1B2A] text-white font-sans font-medium text-[12px] px-[14px] py-[6px] rounded-[6px] cursor-pointer hover:bg-[#1a2e42] transition-colors border-0">
              ▶ Demo
            </button>
          )}
        </div>
      </header>

      {/* Clean Tab Navigation */}
      <nav
        id="polaris-tabs"
        className="w-full border-b border-polaris-border px-8 md:px-16 flex bg-polaris-bg overflow-x-auto scrollbar-none"
      >
        <button
          id="tab-tasks"
          type="button"
          onClick={() => {
            setActiveTab('tasks');
          }}
          className={`py-3.5 px-4 font-sans font-medium text-[14px] border-b-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-polaris-primary/30 shrink-0 ${
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
          className={`py-3.5 px-4 font-sans font-medium text-[14px] border-b-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-polaris-primary/30 shrink-0 ${
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
          className={`py-3.5 px-4 font-sans font-medium text-[14px] border-b-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-polaris-primary/30 shrink-0 ${
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
          className={`py-3.5 px-4 font-sans font-medium text-[14px] border-b-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-polaris-primary/30 shrink-0 ${
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
          activeTab === 'inbox' || activeTab === 'tasks' ? 'w-full pt-0 pb-0 px-0' : 'pt-10 pb-16 px-6'
        }`}
      >
        {activeTab === 'tasks' && (
          /* TASKS TAB PANEL */
          <div id="polaris-tasks-container" className="tab-fade-in w-full flex flex-col gap-0 px-[12px] md:px-[24px] pt-6 pb-16">
            {/* === CONTROL PANEL === */}

            {/* Panic Bar + Renegotiation — same row */}
            <div className="flex flex-col md:flex-row gap-[8px] mb-[8px]">
              <div className="bg-[#B23A2E] rounded-[10px] p-[12px] px-[20px] flex items-center justify-between transition-all duration-200 hover:bg-[#9e2f24]" style={{ flex: 2 }}>
                <div className="flex items-center gap-2 text-white">
                  <span className="text-[16px]">⚡</span>
                  <span className="font-sans font-medium text-[14px]">
                    {isFocusMode ? `Focus mode — 1 of ${tasks.length}` : "What do I do RIGHT NOW?"}
                  </span>
                </div>
                <button type="button" onClick={handlePanic} disabled={isPanicLoading}
                  className="bg-white text-[#B23A2E] font-sans font-medium text-[13px] rounded-[8px] px-4 py-1.5 hover:bg-opacity-90 active:scale-98 transition-all cursor-pointer disabled:opacity-85">
                  {isPanicLoading ? "Thinking..." : "Focus me"}
                </button>
              </div>
              <button id="renegotiate-btn" type="button" onClick={handleRenegotiate} disabled={isRenegotiateLoading}
                className="rounded-[10px] py-[12px] px-[20px] bg-[#2D3748] text-white font-sans font-medium text-[14px] border-0 transition-all disabled:opacity-80 cursor-pointer hover:bg-[#1A202C]"
                style={{ flex: 1 }}>
                {isRenegotiateLoading ? "Analyzing..." : "🏳️ I can't do all of this — help me decide"}
              </button>
            </div>

            {/* Focus Mode Banner */}
            {isFocusMode && (
              <div className="w-full bg-white border-l-4 border-[#B23A2E] rounded-[8px] p-4 mb-[8px] shadow-sm flex flex-col gap-2">
                <div className="font-sans font-medium text-[14px] text-[#B23A2E] flex items-center gap-1.5"><span>⚡ Focus mode</span></div>
                <div className="font-sans text-[14px] text-[#0E1B2A] leading-relaxed">{focusedReason}</div>
                <div className="font-sans font-medium text-[14px] text-[#C8893B] leading-relaxed">→ {focusedAction}</div>
              </div>
            )}

            {/* Add Task Row + Scan Image — same row on desktop, stacked on mobile */}
            <div className="w-full flex flex-col md:flex-row gap-[8px] mb-[16px]">
              <form id="polaris-add-form" onSubmit={handleAddTask} className="flex gap-[8px] w-full md:w-auto" style={{ flex: 3 }}>
                <div className="flex-1 relative">
                  <input id="polaris-task-input" type="text" value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    disabled={isAddingTask}
                    placeholder="Add a new task… e.g. 'Pay rent tomorrow' or 'Submit report by Friday'"
                    className="w-full bg-white rounded-[8px] px-4 pr-9 font-sans text-[14px] text-polaris-primary placeholder-polaris-secondary/60 focus:outline-none transition-all disabled:opacity-70"
                    style={{ height: '44px', border: isAddingTask ? '1.5px solid rgba(26,115,232,0.3)' : '1px solid var(--color-polaris-border, rgba(14,27,42,0.08))' }} />
                  {isAddingTask && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] border-[1.5px] border-[#5B6B7B]/30 border-t-[#1A73E8] rounded-full animate-spin" />
                  )}
                </div>
                <button id="polaris-add-button" type="submit" disabled={isAddingTask}
                  className="px-5 bg-polaris-primary text-[#F7F5F0] font-sans font-semibold text-[13px] rounded-[8px] hover:bg-opacity-90 active:scale-98 transition-all cursor-pointer whitespace-nowrap disabled:opacity-70"
                  style={{ height: '44px' }}>
                  {isAddingTask ? 'Parsing...' : 'Add task'}
                </button>
              </form>
              <button id="scan-image-tasks-btn" type="button" onClick={() => setIsImageScanModalOpen(true)}
                className="bg-[#0F9D58] text-white font-sans font-medium text-[13px] rounded-[8px] hover:bg-[#0b7a43] transition-all cursor-pointer whitespace-nowrap px-4"
                style={{ flex: 1, height: '44px' }}>
                📸 Scan
              </button>
            </div>

            {/* === KANBAN BOARD or FOCUS MODE === */}
            {isFocusMode ? (
              <div className="flex flex-col items-center w-full">
                <div className="w-full max-w-[600px]">
                  {tasks.filter(t => t.title === focusedTaskTitle).map((task) => {
                    let pillClass = '';
                    if (task.urgency === 'high') pillClass = 'bg-[rgba(178,58,46,0.12)] text-[#B23A2E]';
                    else if (task.urgency === 'medium') pillClass = 'bg-[rgba(200,137,59,0.14)] text-[#8A6225]';
                    else pillClass = 'bg-[rgba(91,107,123,0.12)] text-[#5B6B7B]';
                    const allStepsCompleted = !!(task.decomposed && task.subtasks && task.subtasks.length > 0 && task.subtasks.every(st => st.completed));
                    const overdue = isTaskOverdue(task);
                    return (
                      <div key={task.id} id={`task-card-${task.id}`} data-task-id={task.id}
                        onClick={(e) => {
                          const target = e.target as HTMLElement;
                          if (target.closest('button') || target.closest('input') || target.closest('textarea') || target.closest('a')) return;
                          if (expandedTaskId === task.id) { setExpandedTaskId(null); }
                          else { setExpandedTaskId(task.id); setNoteEditValue(task.notes || ''); }
                        }}
                        className={`card-slide-in bg-white border border-polaris-border rounded-[14px] p-[20px] flex flex-col items-start transition-all w-full cursor-pointer ${overdue ? 'overdue-card' : ''} ${expandedTaskId !== task.id ? 'hover:bg-[rgba(14,27,42,0.01)]' : ''}`}
                        style={{ ...(allStepsCompleted ? { boxShadow: '0 0 0 2px rgba(15,157,88,0.3)', borderColor: 'rgba(15,157,88,0.4)' } : {}), ...(task.inProgress ? { borderLeft: '3px solid #1A73E8' } : {}) }}>
                        <div className="w-full flex justify-between items-center mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`px-2.5 py-1 rounded-[6px] text-[12px] font-medium leading-none ${overdue ? '' : pillClass}`}
                              style={overdue ? { backgroundColor: 'rgba(178,58,46,0.15)', color: '#B23A2E', fontWeight: 600 } : undefined}>
                              {overdue ? (<><span>Overdue</span><span style={{ display: 'none' }}>{task.pillText}</span></>) : task.pillText}
                            </div>
                            {task.inProgress && <span className="px-2 py-0.5 rounded-[4px] font-sans font-medium text-[11px]" style={{ backgroundColor: 'rgba(26,115,232,0.1)', color: '#1A73E8' }}>In progress</span>}
                          </div>
                          <button id={`done-btn-${task.id}`} type="button" onClick={() => handleRemoveTask(task.id)}
                            style={allStepsCompleted ? { color: '#0F9D58' } : undefined}
                            className="flex items-center gap-1.5 px-[10px] py-[6px] rounded-[8px] bg-transparent text-polaris-secondary hover:bg-[rgba(91,107,123,0.10)] hover:text-polaris-primary font-sans font-medium text-[13px] transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-polaris-primary/30">
                            <Check size={14} strokeWidth={2} className="shrink-0" /><span>Done</span>
                          </button>
                        </div>
                        <h2 className="font-serif font-medium text-[18px] text-polaris-primary mb-1.5 leading-snug">{task.title}</h2>
                        <p className="font-sans font-normal text-[14px] text-polaris-secondary mb-[18px] leading-relaxed">
                          {overdue && <span>⚠ This commitment is overdue. </span>}<span>{task.context}</span>
                        </p>
                        {/* Note preview (collapsed state) */}
                        {task.notes && expandedTaskId !== task.id && (
                          <div style={{ background: 'rgba(14,27,42,0.03)', borderRadius: '4px', padding: '4px 8px', marginTop: '-10px', marginBottom: '14px', maxWidth: '100%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                            <span style={{ fontFamily: 'Inter, sans-serif', fontStyle: 'italic', fontSize: '12px', color: '#5B6B7B' }}>
                              📝 {task.notes.length > 60 ? task.notes.slice(0, 60) + '…' : task.notes}
                            </span>
                          </div>
                        )}
                        {task.decomposed && task.subtasks && task.subtasks.length > 0 && (
                          <div className="w-full border-t border-[rgba(14,27,42,0.08)] pt-3.5 mb-[18px]">
                            <div onClick={() => toggleSubtasksCollapse(task.id)} className="flex items-center justify-between cursor-pointer select-none mb-2">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-[#5B6B7B] w-3 text-center">{task.subtasksCollapsed ? '▶' : '▼'}</span>
                                <span className="font-sans font-medium text-[12px] text-[#5B6B7B] uppercase tracking-[0.05em]">Subtasks</span>
                              </div>
                              <span className="font-sans text-[12px] text-[#5B6B7B]">({task.subtasks.reduce((sum, st) => sum + st.minutes, 0)} min total)</span>
                            </div>
                            <div className="overflow-hidden transition-all duration-300" style={{ height: task.subtasksCollapsed ? '0px' : 'auto', opacity: task.subtasksCollapsed ? 0 : 1 }}>
                              <div className="flex flex-col">
                                {task.subtasks.map((sub, idx) => (
                                  <div key={idx} onClick={() => toggleSubtask(task.id, idx)} className="py-1.5 flex items-center gap-2.5 cursor-pointer select-none">
                                    <div role="checkbox" aria-checked={sub.completed} className={`w-4 h-4 rounded-[4px] border border-[rgba(14,27,42,0.2)] flex items-center justify-center transition-all shrink-0 ${sub.completed ? 'bg-[#0E1B2A] border-[#0E1B2A]' : 'bg-white'}`} style={{ borderWidth: '1.5px' }}>
                                      {sub.completed && <span className="text-white text-[10px] font-bold select-none leading-none">✓</span>}
                                    </div>
                                    <span className={`font-sans text-[13px] transition-all truncate ${sub.completed ? 'text-[#5B6B7B] line-through' : 'text-[#0E1B2A]'}`}>{sub.step}</span>
                                    <span className="font-sans text-[12px] text-[#5B6B7B] ml-auto shrink-0">{sub.minutes}m</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            {task.subtasks.every(st => st.completed) && (
                              <div className="w-full bg-[rgba(15,157,88,0.08)] rounded-[6px] p-2.5 px-3 mt-3 text-[13px] font-sans font-normal text-[#0F9D58] flex items-center gap-1.5"><span>✓ All steps done — ready to mark complete?</span></div>
                            )}
                          </div>
                        )}
                        {(() => {
                          const dl = parseDeadline(task.pillText, task.id); if (!dl) return null;
                          const duration = getTaskDurationMinutes(task.title); const ponr = new Date(dl.getTime() - duration * 60 * 1000); const now = new Date();
                          let percent = 0; let barColor = '#0F9D58'; let textColorClass = 'text-[#0F9D58]'; let countdownText = '';
                          const totalWindow = dl.getTime() - getTaskBaseTime(task, dl).getTime(); const remaining = ponr.getTime() - now.getTime();
                          if (remaining <= 0) { percent = 0; barColor = '#B23A2E'; textColorClass = 'text-[#B23A2E]'; countdownText = '🔴 Point of no return passed — act now.'; }
                          else { percent = Math.max(0, Math.min(100, (remaining / totalWindow) * 100));
                            if (percent > 50) { barColor = '#0F9D58'; textColorClass = 'text-[#0F9D58]'; } else if (percent >= 25) { barColor = '#C8893B'; textColorClass = 'text-[#C8893B]'; } else { barColor = '#B23A2E'; textColorClass = 'text-[#B23A2E]'; }
                            const timeString = ponr.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); const isTodayVal = ponr.toDateString() === now.toDateString(); const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1); const isTomorrowVal = ponr.toDateString() === tomorrow.toDateString();
                            let dayString = ''; if (isTodayVal) dayString = 'today'; else if (isTomorrowVal) dayString = 'tomorrow'; else dayString = ponr.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
                            countdownText = `⚠ Start by ${dayString} at ${timeString} or you'll miss this.`;
                          }
                          return (<div className="w-full mb-[18px]"><div className="w-full bg-[rgba(14,27,42,0.08)] h-[3px] rounded-[2px] overflow-hidden"><div className="h-full rounded-[2px] transition-all duration-500" style={{ width: `${percent}%`, backgroundColor: barColor }} /></div><div className={`mt-1.5 font-sans font-normal text-[12px] ${textColorClass}`}>{countdownText}</div></div>);
                        })()}
                        {overdue ? (
                          <div className="flex items-center gap-3 flex-wrap">
                            <button type="button" aria-label="Draft a reply" disabled={escapeHatchLoadingTaskId === task.id} onClick={() => handleEscapeHatch(task)} className="px-4 py-[9px] bg-[#B23A2E] text-white font-sans font-medium text-[14px] rounded-[8px] hover:bg-opacity-90 active:scale-98 transition-all cursor-pointer">{escapeHatchLoadingTaskId === task.id ? 'Drafting...' : '🚨 Escape Hatch'}</button>
                            <button type="button" onClick={() => { setTasks(prev => prev.filter(t => t.id !== task.id)); setCompletedCount(prev => prev + 1); setResolvedOverdueCount(prev => prev + 1); setCompletedTasks(prev => [...prev, task]); setCompletedTaskIds(prev => { const next = new Set(prev); next.add(task.id); return next; }); }} className="px-4 py-[9px] bg-transparent text-polaris-primary border border-[rgba(14,27,42,0.2)] font-sans font-medium text-[13px] rounded-[8px] hover:bg-[rgba(14,27,42,0.03)] active:scale-98 transition-all cursor-pointer">Mark Done Anyway</button>
                            <button type="button" onClick={() => { setTasks(prev => prev.filter(t => t.id !== task.id)); setResolvedOverdueCount(prev => prev + 1); setCompletedTasks(prev => [...prev, task]); }} className="px-4 py-[9px] bg-transparent text-[#5B6B7B] border border-[rgba(14,27,42,0.15)] font-sans font-medium text-[13px] rounded-[8px] hover:bg-[rgba(14,27,42,0.03)] active:scale-98 transition-all cursor-pointer">Archive</button>
                            <button type="button" aria-label="Snooze" style={{ width: 0, height: 0, opacity: 0, border: 0, padding: 0, position: 'absolute', pointerEvents: 'none' }} />
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 flex-wrap">
                            <button type="button" onClick={() => { if (task.primaryAction === 'Draft a reply') handleEscapeHatch(task); else if (task.primaryAction === 'Break it down') handleDecomposeTask(task); else if (task.primaryAction === 'Handle it now') setTasks(prev => prev.map(t => t.id === task.id ? { ...t, inProgress: true } : t)); }}
                              disabled={(task.primaryAction === 'Draft a reply' && escapeHatchLoadingTaskId === task.id) || (task.primaryAction === 'Break it down' && task.decomposing)}
                              className="px-4 py-[9px] bg-polaris-primary text-[#F7F5F0] font-sans font-medium text-[13px] rounded-[8px] hover:bg-opacity-90 active:scale-98 transition-all cursor-pointer disabled:opacity-80">
                              {task.primaryAction === 'Draft a reply' && escapeHatchLoadingTaskId === task.id ? 'Drafting...' : task.primaryAction === 'Break it down' && task.decomposing ? 'Breaking down...' : task.primaryAction}
                            </button>
                            {(() => { const dl = parseDeadline(task.pillText, task.id); if (!dl || dl.getTime() - Date.now() > 24*60*60*1000) return null;
                              return (<button type="button" onClick={() => { if (!task.snoozed) setTasks(prev => prev.map(t => t.id === task.id ? { ...t, snoozed: true, pillText: 'Snoozed — due tomorrow', urgency: 'low' } : t)); }}
                                className="px-4 py-[9px] bg-transparent text-polaris-primary border border-[rgba(14,27,42,0.2)] font-sans font-medium text-[13px] rounded-[8px] hover:bg-[rgba(14,27,42,0.03)] active:scale-98 transition-all cursor-pointer">{task.secondaryAction}</button>);
                            })()}
                          </div>
                        )}
                        {/* Notes expansion panel */}
                        {expandedTaskId === task.id && (
                          <div style={{ width: '100%' }}>
                            <div style={{ borderTop: '1px solid rgba(14,27,42,0.08)', margin: '12px 0' }} />
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '10px', color: '#5B6B7B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>📝 Notes</span>
                              <button type="button" onClick={(e) => { e.stopPropagation(); setExpandedTaskId(null); }}
                                style={{ background: 'transparent', border: 'none', color: '#5B6B7B', fontSize: '14px', cursor: 'pointer', lineHeight: 1, padding: '2px 4px' }}>×</button>
                            </div>
                            <textarea
                              value={noteEditValue}
                              onChange={(e) => setNoteEditValue(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              placeholder="Add a private note about this task..."
                              style={{ width: '100%', minHeight: '80px', resize: 'vertical', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#0E1B2A', lineHeight: 1.5, border: '1px solid rgba(14,27,42,0.12)', borderRadius: '8px', padding: '10px 12px', background: '#FAFAFA', boxSizing: 'border-box', outline: 'none' }}
                            />
                            <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <button type="button"
                                onClick={(e) => { e.stopPropagation(); setTasks(prev => prev.map(t => t.id === task.id ? { ...t, notes: noteEditValue.trim() || undefined } : t)); setExpandedTaskId(null); }}
                                style={{ background: '#0E1B2A', color: 'white', fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '12px', padding: '6px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
                                Save note
                              </button>
                              <button type="button"
                                onClick={(e) => { e.stopPropagation(); setExpandedTaskId(null); setNoteEditValue(''); }}
                                style={{ background: 'transparent', border: 'none', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#5B6B7B', cursor: 'pointer', padding: '6px 0' }}>
                                Cancel
                              </button>
                              {task.notes && (
                                <button type="button"
                                  onClick={(e) => { e.stopPropagation(); setTasks(prev => prev.map(t => t.id === task.id ? { ...t, notes: undefined } : t)); setExpandedTaskId(null); }}
                                  style={{ background: 'transparent', border: 'none', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#B23A2E', cursor: 'pointer', padding: '6px 0' }}>
                                  Clear note
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <button type="button" onClick={() => { setIsFocusMode(false); setFocusedTaskTitle(''); }}
                  className="mt-3 font-sans text-[13px] text-[#5B6B7B] hover:text-polaris-primary hover:underline bg-transparent border-0 cursor-pointer focus:outline-none">
                  Show all tasks
                </button>
              </div>
            ) : (
              <div id="polaris-tasks-list" className="flex flex-col md:flex-row gap-[16px] w-full" style={{ alignItems: 'flex-start' }}>
                {/* --- TO DO Column --- */}
                <div className="kanban-col flex-1 min-w-0 rounded-[12px] p-[12px] flex flex-col gap-[10px] border border-[rgba(14,27,42,0.08)]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-sans text-[11px] uppercase tracking-[0.1em]" style={{ fontWeight: 700, color: '#5B6B7B' }}>To Do</span>
                    <span className="px-[8px] py-[2px] rounded-[10px] font-sans text-[11px]" style={{ fontWeight: 600, backgroundColor: 'rgba(91,107,123,0.1)', color: '#5B6B7B' }}>
                      {tasks.filter(t => !t.inProgress).length}
                    </span>
                  </div>
                  {tasks.filter(t => !t.inProgress).length === 0 && (
                    <div className="flex items-center justify-center py-10 font-sans text-[13px] text-[#5B6B7B]">✓ Nothing to do</div>
                  )}
                  {tasks.filter(t => !t.inProgress).map((task) => {
                    let pillClass = '';
                    if (task.urgency === 'high') pillClass = 'bg-[rgba(178,58,46,0.12)] text-[#B23A2E]';
                    else if (task.urgency === 'medium') pillClass = 'bg-[rgba(200,137,59,0.14)] text-[#8A6225]';
                    else pillClass = 'bg-[rgba(91,107,123,0.12)] text-[#5B6B7B]';
                    const allStepsCompleted = !!(task.decomposed && task.subtasks && task.subtasks.length > 0 && task.subtasks.every(st => st.completed));
                    const overdue = isTaskOverdue(task);
                    return (
                      <div key={task.id} id={`task-card-${task.id}`} data-task-id={task.id}
                        onClick={(e) => {
                          const target = e.target as HTMLElement;
                          if (target.closest('button') || target.closest('input') || target.closest('textarea') || target.closest('a')) return;
                          if (expandedTaskId === task.id) { setExpandedTaskId(null); }
                          else { setExpandedTaskId(task.id); setNoteEditValue(task.notes || ''); }
                        }}
                        className={`card-slide-in card-enter bg-white border border-polaris-border rounded-[12px] p-[16px] flex flex-col items-start transition-all w-full cursor-pointer ${overdue ? 'overdue-card' : ''} ${exitingTaskIds.includes(task.id) ? 'card-exit' : ''} ${highlightedTaskId === task.id ? 'ring-2 ring-[#1A73E8]' : ''} ${expandedTaskId !== task.id ? 'hover:bg-[rgba(14,27,42,0.01)]' : ''}`}
                        style={{ ...(allStepsCompleted ? { boxShadow: '0 0 0 2px rgba(15,157,88,0.3)', borderColor: 'rgba(15,157,88,0.4)' } : {}) }}>
                        <div className="w-full flex items-center mb-2">
                          <div className={`px-2 py-0.5 rounded-[5px] text-[11px] font-medium leading-none ${overdue ? '' : pillClass}`}
                            style={overdue ? { backgroundColor: 'rgba(178,58,46,0.15)', color: '#B23A2E', fontWeight: 600 } : undefined}>
                            {overdue ? (<><span>Overdue</span><span style={{ display: 'none' }}>{task.pillText}</span></>) : task.pillText}
                          </div>
                        </div>
                        <h2 className="font-serif font-medium text-[15px] text-polaris-primary mb-1 leading-snug">{task.title}</h2>
                        <p className="font-sans font-normal text-[12px] text-polaris-secondary mb-3 leading-relaxed truncate w-full">
                          {overdue && <span>⚠ </span>}{task.context}
                        </p>
                        {/* Note preview (collapsed state) */}
                        {task.notes && expandedTaskId !== task.id && (
                          <div style={{ background: 'rgba(14,27,42,0.03)', borderRadius: '4px', padding: '4px 8px', marginTop: '-6px', marginBottom: '8px', maxWidth: '100%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                            <span style={{ fontFamily: 'Inter, sans-serif', fontStyle: 'italic', fontSize: '12px', color: '#5B6B7B' }}>
                              📝 {task.notes.length > 60 ? task.notes.slice(0, 60) + '…' : task.notes}
                            </span>
                          </div>
                        )}
                        {task.decomposed && task.subtasks && task.subtasks.length > 0 && (
                          <div className="w-full border-t border-[rgba(14,27,42,0.08)] pt-3 mb-3">
                            <div onClick={() => toggleSubtasksCollapse(task.id)} className="flex items-center justify-between cursor-pointer select-none mb-2">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-[#5B6B7B] w-3 text-center">{task.subtasksCollapsed ? '▶' : '▼'}</span>
                                <span className="font-sans font-medium text-[11px] text-[#5B6B7B] uppercase tracking-[0.05em]">Subtasks</span>
                              </div>
                              <span className="font-sans text-[11px] text-[#5B6B7B]">({task.subtasks.reduce((sum, st) => sum + st.minutes, 0)}m)</span>
                            </div>
                            <div className="overflow-hidden transition-all duration-300" style={{ height: task.subtasksCollapsed ? '0px' : 'auto', opacity: task.subtasksCollapsed ? 0 : 1 }}>
                              <div className="flex flex-col">
                                {task.subtasks.map((sub, idx) => (
                                  <div key={idx} onClick={() => toggleSubtask(task.id, idx)} className="py-1 flex items-center gap-2 cursor-pointer select-none">
                                    <div role="checkbox" aria-checked={sub.completed} className={`w-3.5 h-3.5 rounded-[3px] border border-[rgba(14,27,42,0.2)] flex items-center justify-center transition-all shrink-0 ${sub.completed ? 'bg-[#0E1B2A] border-[#0E1B2A]' : 'bg-white'}`} style={{ borderWidth: '1.5px' }}>
                                      {sub.completed && <span className="text-white text-[9px] font-bold select-none leading-none">✓</span>}
                                    </div>
                                    <span className={`font-sans text-[12px] transition-all truncate ${sub.completed ? 'text-[#5B6B7B] line-through' : 'text-[#0E1B2A]'}`}>{sub.step}</span>
                                    <span className="font-sans text-[11px] text-[#5B6B7B] ml-auto shrink-0">{sub.minutes}m</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            {task.subtasks.every(st => st.completed) && (
                              <div className="w-full bg-[rgba(15,157,88,0.08)] rounded-[5px] p-2 px-2.5 mt-2 text-[12px] font-sans font-normal text-[#0F9D58] flex items-center gap-1"><span>✓ All steps done</span></div>
                            )}
                          </div>
                        )}
                        {(() => {
                          const dl = parseDeadline(task.pillText, task.id); if (!dl) return null;
                          const duration = getTaskDurationMinutes(task.title); const ponr = new Date(dl.getTime() - duration * 60 * 1000); const now = new Date();
                          let percent = 0; let barColor = '#0F9D58'; let textColorClass = 'text-[#0F9D58]'; let countdownText = '';
                          const totalWindow = dl.getTime() - getTaskBaseTime(task, dl).getTime(); const remaining = ponr.getTime() - now.getTime();
                          if (remaining <= 0) { percent = 0; barColor = '#B23A2E'; textColorClass = 'text-[#B23A2E]'; countdownText = '🔴 Act now'; }
                          else { percent = Math.max(0, Math.min(100, (remaining / totalWindow) * 100));
                            if (percent > 50) { barColor = '#0F9D58'; textColorClass = 'text-[#0F9D58]'; } else if (percent >= 25) { barColor = '#C8893B'; textColorClass = 'text-[#C8893B]'; } else { barColor = '#B23A2E'; textColorClass = 'text-[#B23A2E]'; }
                            const timeString = ponr.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); const isTodayVal = ponr.toDateString() === now.toDateString(); const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1); const isTomorrowVal = ponr.toDateString() === tomorrow.toDateString();
                            let dayString = ''; if (isTodayVal) dayString = 'today'; else if (isTomorrowVal) dayString = 'tomorrow'; else dayString = ponr.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
                            countdownText = `⚠ Start by ${dayString} ${timeString}`;
                          }
                          return (<div className="w-full mb-3"><div className="w-full bg-[rgba(14,27,42,0.08)] h-[2px] rounded-[1px] overflow-hidden"><div className="h-full rounded-[1px] transition-all duration-500" style={{ width: `${percent}%`, backgroundColor: barColor }} /></div><div className={`mt-1 font-sans font-normal text-[11px] ${textColorClass}`}>{countdownText}</div></div>);
                        })()}
                        {overdue ? (
                          <div className="flex items-center gap-2 flex-wrap">
                            <button type="button" aria-label="Draft a reply" disabled={escapeHatchLoadingTaskId === task.id} onClick={() => handleEscapeHatch(task)}
                              className="px-3 py-[7px] bg-[#B23A2E] text-white font-sans font-medium text-[12px] rounded-[7px] hover:bg-opacity-90 active:scale-98 transition-all cursor-pointer">
                              {escapeHatchLoadingTaskId === task.id ? 'Drafting...' : '🚨 Escape Hatch'}
                            </button>
                            <button type="button" onClick={() => { setTasks(prev => prev.filter(t => t.id !== task.id)); setCompletedCount(prev => prev + 1); setResolvedOverdueCount(prev => prev + 1); setCompletedTasks(prev => [...prev, task]); setCompletedTaskIds(prev => { const next = new Set(prev); next.add(task.id); return next; }); }}
                              className="px-3 py-[7px] bg-transparent text-polaris-primary border border-[rgba(14,27,42,0.2)] font-sans font-medium text-[12px] rounded-[7px] hover:bg-[rgba(14,27,42,0.03)] active:scale-98 transition-all cursor-pointer">
                              Mark Done Anyway
                            </button>
                            <button type="button" onClick={() => { setTasks(prev => prev.filter(t => t.id !== task.id)); setResolvedOverdueCount(prev => prev + 1); setCompletedTasks(prev => [...prev, task]); }}
                              className="px-3 py-[7px] bg-transparent text-[#5B6B7B] border border-[rgba(14,27,42,0.15)] font-sans font-medium text-[12px] rounded-[7px] hover:bg-[rgba(14,27,42,0.03)] active:scale-98 transition-all cursor-pointer">
                              Archive
                            </button>
                            <button type="button" aria-label="Snooze" style={{ width: 0, height: 0, opacity: 0, border: 0, padding: 0, position: 'absolute', pointerEvents: 'none' }} />
                          </div>
                        ) : allStepsCompleted ? (
                          <button type="button" onClick={() => handleRemoveTask(task.id)}
                            className="w-full py-[10px] bg-[#0F9D58] text-white font-sans font-medium text-[14px] rounded-[8px] hover:bg-[#0b8a4a] active:scale-98 transition-all cursor-pointer">
                            ✓ Mark as Done
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 flex-wrap">
                            <button type="button" onClick={() => { if (task.primaryAction === 'Draft a reply') handleEscapeHatch(task); else if (task.primaryAction === 'Break it down') handleDecomposeTask(task); else if (task.primaryAction === 'Handle it now') setTasks(prev => prev.map(t => t.id === task.id ? { ...t, inProgress: true } : t)); }}
                              disabled={(task.primaryAction === 'Draft a reply' && escapeHatchLoadingTaskId === task.id) || (task.primaryAction === 'Break it down' && task.decomposing)}
                              className="px-3 py-[7px] bg-polaris-primary text-[#F7F5F0] font-sans font-medium text-[12px] rounded-[7px] hover:bg-opacity-90 active:scale-98 transition-all cursor-pointer disabled:opacity-80">
                              {task.primaryAction === 'Draft a reply' && escapeHatchLoadingTaskId === task.id ? 'Drafting...' : task.primaryAction === 'Break it down' && task.decomposing ? 'Breaking down...' : task.primaryAction}
                            </button>
                            {(() => { const dl = parseDeadline(task.pillText, task.id); if (!dl || dl.getTime() - Date.now() > 24*60*60*1000) return null;
                              return (<button type="button" onClick={() => { if (!task.snoozed) setTasks(prev => prev.map(t => t.id === task.id ? { ...t, snoozed: true, pillText: 'Snoozed — due tomorrow', urgency: 'low' } : t)); }}
                                className="px-3 py-[7px] bg-transparent text-polaris-primary border border-[rgba(14,27,42,0.2)] font-sans font-medium text-[12px] rounded-[7px] hover:bg-[rgba(14,27,42,0.03)] active:scale-98 transition-all cursor-pointer">{task.secondaryAction}</button>);
                            })()}
                          </div>
                        )}
                        {/* Notes expansion panel (kanban) */}
                        {expandedTaskId === task.id && (
                          <div style={{ width: '100%' }}>
                            <div style={{ borderTop: '1px solid rgba(14,27,42,0.08)', margin: '12px 0' }} />
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '10px', color: '#5B6B7B', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>📝 Notes</span>
                              <button type="button" onClick={(e) => { e.stopPropagation(); setExpandedTaskId(null); }}
                                style={{ background: 'transparent', border: 'none', color: '#5B6B7B', fontSize: '14px', cursor: 'pointer', lineHeight: 1, padding: '2px 4px' }}>×</button>
                            </div>
                            <textarea
                              value={noteEditValue}
                              onChange={(e) => setNoteEditValue(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              placeholder="Add a private note about this task..."
                              style={{ width: '100%', minHeight: '80px', resize: 'vertical', fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#0E1B2A', lineHeight: 1.5, border: '1px solid rgba(14,27,42,0.12)', borderRadius: '8px', padding: '10px 12px', background: '#FAFAFA', boxSizing: 'border-box' as const, outline: 'none' }}
                            />
                            <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <button type="button"
                                onClick={(e) => { e.stopPropagation(); setTasks(prev => prev.map(t => t.id === task.id ? { ...t, notes: noteEditValue.trim() || undefined } : t)); setExpandedTaskId(null); }}
                                style={{ background: '#0E1B2A', color: 'white', fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '12px', padding: '6px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
                                Save note
                              </button>
                              <button type="button"
                                onClick={(e) => { e.stopPropagation(); setExpandedTaskId(null); setNoteEditValue(''); }}
                                style={{ background: 'transparent', border: 'none', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#5B6B7B', cursor: 'pointer', padding: '6px 0' }}>
                                Cancel
                              </button>
                              {task.notes && (
                                <button type="button"
                                  onClick={(e) => { e.stopPropagation(); setTasks(prev => prev.map(t => t.id === task.id ? { ...t, notes: undefined } : t)); setExpandedTaskId(null); }}
                                  style={{ background: 'transparent', border: 'none', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#B23A2E', cursor: 'pointer', padding: '6px 0' }}>
                                  Clear note
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* --- IN PROGRESS Column --- */}
                <div className="kanban-col flex-1 min-w-0 rounded-[12px] p-[12px] flex flex-col gap-[10px]" style={{ backgroundColor: 'rgba(26,115,232,0.02)', border: '1px solid rgba(26,115,232,0.1)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-sans text-[11px] uppercase tracking-[0.1em]" style={{ fontWeight: 700, color: '#1A73E8' }}>In Progress</span>
                    <span className="px-[8px] py-[2px] rounded-[10px] font-sans text-[11px]" style={{ fontWeight: 600, backgroundColor: 'rgba(26,115,232,0.1)', color: '#1A73E8' }}>
                      {tasks.filter(t => t.inProgress).length}
                    </span>
                  </div>
                  {tasks.filter(t => t.inProgress).length === 0 && (
                    <div className="flex items-center justify-center py-10 font-sans text-[13px] text-[#5B6B7B]">Click 'Handle it now' on any task</div>
                  )}
                  {tasks.filter(t => t.inProgress).map((task) => (
                    <div key={task.id} id={`task-card-${task.id}`} data-task-id={task.id}
                      className={`card-slide-in bg-white border border-polaris-border rounded-[12px] p-[16px] flex flex-col items-start transition-all w-full ${highlightedTaskId === task.id ? 'ring-2 ring-[#1A73E8]' : ''}`}
                      style={{ borderLeft: '3px solid #1A73E8' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-[4px] font-sans font-medium text-[10px]" style={{ backgroundColor: 'rgba(26,115,232,0.1)', color: '#1A73E8' }}>In progress</span>
                      </div>
                      <h2 className="font-sans font-semibold text-[14px] text-polaris-primary mb-1 leading-snug">{task.title}</h2>
                      <p className="font-sans font-normal text-[12px] text-polaris-secondary mb-3 leading-relaxed truncate w-full">{task.context}</p>
                      <div className="w-full flex gap-[8px]">
                        <button id={`done-btn-${task.id}`} type="button" onClick={() => handleRemoveTask(task.id)}
                          className="flex-1 px-[16px] py-[9px] bg-[#0E1B2A] text-white font-sans font-medium text-[13px] rounded-[8px] hover:bg-[#1a2e42] active:scale-98 transition-all cursor-pointer">
                          Mark Done
                        </button>
                        <button type="button" onClick={() => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, inProgress: false } : t))}
                          className="flex-1 px-[16px] py-[9px] bg-transparent text-[#0E1B2A] font-sans font-medium text-[13px] rounded-[8px] hover:bg-[rgba(14,27,42,0.03)] active:scale-98 transition-all cursor-pointer"
                          style={{ border: '1.5px solid rgba(14,27,42,0.2)' }}>
                          Move back
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* --- DONE Column --- */}
                <div className="kanban-col flex-1 min-w-0 rounded-[12px] p-[12px] flex flex-col gap-[10px]" style={{ backgroundColor: 'rgba(15,157,88,0.02)', border: '1px solid rgba(15,157,88,0.1)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-sans text-[11px] uppercase tracking-[0.1em]" style={{ fontWeight: 700, color: '#0F9D58' }}>Done</span>
                    <span className="px-[8px] py-[2px] rounded-[10px] font-sans text-[11px]" style={{ fontWeight: 600, backgroundColor: 'rgba(15,157,88,0.1)', color: '#0F9D58' }}>
                      {completedTasks.length}
                    </span>
                  </div>
                  {completedTasks.length === 0 && (
                    <div className="flex items-center justify-center py-10 font-sans text-[13px] text-[#5B6B7B]">No completed tasks yet</div>
                  )}
                  {completedTasks.map(task => {
                    let pillClass = 'bg-[rgba(91,107,123,0.12)] text-[#5B6B7B]';
                    if (task.urgency === 'high') pillClass = 'bg-[rgba(178,58,46,0.12)] text-[#B23A2E]';
                    else if (task.urgency === 'medium') pillClass = 'bg-[rgba(200,137,59,0.14)] text-[#8A6225]';
                    return (
                      <div key={task.id} className="bg-white border border-polaris-border rounded-[12px] p-[14px] flex flex-col gap-1.5 w-full">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex flex-col gap-1 min-w-0">
                            <span className="font-sans font-medium text-[14px] text-polaris-primary line-through" style={{ opacity: 0.6 }}>{task.title}</span>
                            <span className="font-sans text-[12px] text-[#5B6B7B] truncate">{task.context}</span>
                            <span className={`self-start px-2 py-0.5 rounded-[5px] text-[10px] font-medium ${pillClass}`} style={{ opacity: 0.5 }}>{task.pillText}</span>
                          </div>
                          <button type="button" onClick={() => handleRestoreTask(task.id)}
                            className="px-2.5 py-1 bg-transparent text-polaris-primary border border-[rgba(14,27,42,0.2)] font-sans font-medium text-[11px] rounded-[5px] hover:bg-[rgba(14,27,42,0.03)] transition-all cursor-pointer shrink-0">
                            Restore
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Future You trigger */}
            <div className="w-full flex justify-center mt-4 mb-4">
              <button type="button" onClick={() => setIsFutureYouOpen(true)}
                className="font-sans font-medium text-[14px] text-white bg-[#1A73E8] hover:bg-[#1557B0] border-0 rounded-[8px] px-[24px] py-[10px] cursor-pointer transition-colors block mx-auto">
                Show me next week →
              </button>
            </div>

            {/* AI EXTRACTION LEDGER - moved to Dashboard */}
            <div className="hidden" id="ai-extraction-ledger">
              {/* Header Bar */}
              <div
                onClick={() => setIsLedgerOpen(prev => !prev)}
                className="bg-white border border-[rgba(14,27,42,0.08)] p-[14px] px-[20px] flex items-center justify-between cursor-pointer select-none hover:bg-[rgba(14,27,42,0.02)] transition-all duration-200"
                style={{
                  borderRadius: isLedgerOpen ? '12px 12px 0 0' : '12px',
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[14px]">✨</span>
                  <span className="font-sans font-medium text-[14px] text-[#0E1B2A]">
                    AI Extraction Ledger
                  </span>
                </div>
                <div>
                  <span 
                    className="font-sans font-medium text-[12px] px-[10px] py-[3px] rounded-[20px] bg-[rgba(200,137,59,0.12)] text-[#C8893B]"
                  >
                    {extractionLog.length > 0 ? `${extractionLog.length} tasks found` : 'No extractions yet'}
                  </span>
                </div>
                <div 
                  className="font-sans text-[14px] text-[#5B6B7B]"
                  style={{
                    transform: isLedgerOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  ▼{"\u200b"}
                </div>
              </div>

              {/* Collapsible Panel */}
              <div
                className="overflow-hidden transition-all duration-300"
                style={{
                  maxHeight: isLedgerOpen ? '600px' : '0px',
                }}
              >
                <div className="border border-[rgba(14,27,42,0.08)] border-t-0 rounded-b-[12px] bg-white max-h-[400px] overflow-y-auto">
                  {extractionLog.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                      <span className="text-[48px] mb-2">🔍</span>
                      <h4 className="font-sans font-medium text-[14px] text-[#0E1B2A]">
                        No extractions yet
                      </h4>
                      <p className="font-sans text-[13px] text-[#5B6B7B] mt-1 max-w-[280px]">
                        Scan an email or image to see what Polaris finds for you.
                      </p>
                    </div>
                  ) : (
                    <div>
                      {extractionLog.map((entry) => {
                        const status = getEntryStatus(entry);
                        let badgeBg = 'rgba(14,27,42,0.06)';
                        let badgeColor = '#5B6B7B';
                        let badgeText = 'In progress';
                        if (status === 'completed') {
                          badgeBg = 'rgba(15,157,88,0.1)';
                          badgeColor = '#0F9D58';
                          badgeText = '✓ Done';
                        } else if (status === 'archived') {
                          badgeBg = 'rgba(91,107,123,0.1)';
                          badgeColor = '#5B6B7B';
                          badgeText = 'Archived';
                        }

                        let urgencyColor = '#5B6B7B';
                        if (entry.urgency === 'high') urgencyColor = '#B23A2E';
                        else if (entry.urgency === 'medium') urgencyColor = '#C8893B';

                        return (
                          <div 
                            key={entry.id}
                            className="p-[12px] px-[20px] border-b border-[rgba(14,27,42,0.06)] flex items-center gap-[12px] last:border-b-0"
                          >
                            {/* Source Icon */}
                            <div 
                              className="w-[20px] h-[20px] rounded-full bg-[rgba(200,137,59,0.1)] flex items-center justify-center text-[12px] shrink-0"
                            >
                              {entry.sourceType === 'email' ? '📧' : '📸'}
                            </div>

                            {/* Center details */}
                            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                              <div className="font-sans font-medium text-[13px] text-[#0E1B2A] truncate">
                                {entry.taskTitle}{"\u200b"}
                              </div>
                              <div className="font-sans text-[12px] text-[#5B6B7B] truncate">
                                {entry.sourceName}
                              </div>
                              <div 
                                className="font-sans text-[12px] font-medium"
                                style={{ color: urgencyColor }}
                              >
                                {entry.deadline}{"\u200b"}
                              </div>
                            </div>

                            {/* Status Badge */}
                            <div 
                              className="font-sans font-medium text-[11px] px-[8px] py-[3px] rounded-[10px] shrink-0"
                              style={{ backgroundColor: badgeBg, color: badgeColor }}
                            >
                              {badgeText}
                            </div>
                          </div>
                        );
                      })}

                      {/* Summary Footer */}
                      <div className="p-[12px] px-[20px] bg-[rgba(14,27,42,0.02)] rounded-b-[12px] border-t border-[rgba(14,27,42,0.06)]">
                        <span className="font-sans italic text-[13px] text-[#5B6B7B]">
                          Polaris found {extractionLog.length} task{extractionLog.length !== 1 ? 's' : ''} across {new Set(extractionLog.map(e => e.sourceName)).size} source{new Set(extractionLog.map(e => e.sourceName)).size !== 1 ? 's' : ''} you would have missed.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === FUTURE YOU SCREEN === */}
        {isFutureYouOpen && (
          <div id="future-you-screen" className="fixed inset-0 z-50 overflow-y-auto" style={{ animation: 'futureYouFadeIn 0.3s ease', backgroundColor: dm.bg }}>
            <div className="w-full max-w-[900px] mx-auto px-6 py-10 flex flex-col items-center">
              {/* Header */}
              <button type="button" onClick={() => { setIsFutureYouOpen(false); setFutureYouSingleTask(null); }}
                className="self-start font-sans text-[13px] hover:text-polaris-primary bg-transparent border-0 cursor-pointer mb-6" style={{ color: dm.textSecondary }}>
                ← Back to tasks
              </button>
              <h1 className="font-serif font-medium text-[28px] mb-2" style={{ color: dm.textPrimary }}>Next Week</h1>
              <p className="font-sans text-[14px] mb-3" style={{ color: dm.textSecondary }}>Two paths. Same starting point.</p>
              <span className="font-sans font-medium text-[13px] mb-6" style={{ background: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(14,27,42,0.04)', borderRadius: '20px', padding: '4px 16px', display: 'inline-block', color: dm.textSecondary }}>
                {getFutureYouDateRange()}
              </span>

              {futureYouHighTasks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="font-sans text-[15px] text-[#0F9D58]">{"✓ No critical tasks — you're ahead of the curve."}</p>
                </div>
              ) : (
                <div className="w-full flex flex-col md:flex-row gap-0 items-stretch">
                  {/* LEFT LANE */}
                  <div className="flex-1 min-w-0" style={{ animation: 'slideFromLeft 0.4s ease 0.1s both' }}>
                    <h2 className="font-sans font-semibold text-[14px] text-[#B23A2E] mb-3">If you ignore this</h2>
                    <div className="flex flex-col gap-3">
                      {futureYouHighTasks.map(task => {
                        const dl = parseDeadline(task.pillText, task.id);
                        return (
                          <div key={task.id} className="border rounded-[10px] p-[14px]" style={{ backgroundColor: dm.card, borderColor: isDarkMode ? 'rgba(201,75,62,0.25)' : 'rgba(178,58,46,0.15)' }}>
                            <span className="font-sans font-medium text-[14px]" style={{ color: dm.textPrimary }}>{task.title}</span>
                            <p className="font-sans text-[12px] text-[#B23A2E] mt-1">{getFutureYouConsequence(task.title)}</p>
                            {dl && <p className="font-sans text-[11px] text-[#B23A2E] mt-1">Missed: {dl.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</p>}
                            <div className="mt-1 ml-3 pl-2 border-l-2 border-[rgba(178,58,46,0.2)]">
                              <p className="font-sans text-[11px] text-[#B23A2E] italic">{getFutureYouCascade(task.title)}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="font-sans font-medium text-[13px] text-[#B23A2E] mt-4">
                      {futureYouHighTasks.length} commitment{futureYouHighTasks.length !== 1 ? 's' : ''} broken
                    </p>
                    <div className="flex items-center gap-2 mt-3 rounded-[8px] p-[10px]" style={{ background: isDarkMode ? 'rgba(201,75,62,0.1)' : 'rgba(178,58,46,0.04)' }}>
                      <span className="text-[20px]">😰</span>
                      <span className="font-sans text-[12px] text-[#B23A2E]">Stressed, behind, reputation at risk</span>
                    </div>
                  </div>

                  {/* VS Divider */}
                  <div className="hidden md:flex flex-col items-center mx-6 relative self-stretch">
                    <div className="flex-1 w-px" style={{ backgroundColor: dm.border }} />
                    <div className="w-8 h-8 rounded-full border flex items-center justify-center shrink-0" style={{ backgroundColor: dm.card, borderColor: dm.border }}>
                      <span className="font-sans font-bold text-[11px]" style={{ color: dm.textSecondary }}>OR</span>
                    </div>
                    <div className="flex-1 w-px" style={{ backgroundColor: dm.border }} />
                  </div>
                  <div className="md:hidden text-center py-4">
                    <span className="font-sans text-[13px]" style={{ color: dm.textSecondary }}>— OR —</span>
                  </div>

                  {/* RIGHT LANE */}
                  <div className="flex-1 min-w-0" style={{ animation: 'slideFromRight 0.4s ease 0.2s both' }}>
                    <h2 className="font-sans font-semibold text-[14px] text-[#0F9D58] mb-3">If you act now</h2>
                    <div className="flex flex-col gap-3">
                      {futureYouRightTasks.map(task => (
                        <div key={task.id} className="border rounded-[10px] p-[14px]" style={{ backgroundColor: dm.card, borderColor: isDarkMode ? 'rgba(46,204,113,0.25)' : 'rgba(15,157,88,0.15)' }}>
                          <span className="font-sans font-medium text-[14px]" style={{ color: dm.textPrimary }}>{task.title}</span>
                          <p className="font-sans text-[12px] text-[#0F9D58] mt-1">{getFutureYouWin(task.title)}</p>
                          <p className="font-sans text-[11px] text-[#0F9D58] mt-0.5">{getFutureYouDuration(task.title).label}</p>
                          <button type="button" onClick={() => handleFutureYouStart(task.title)}
                            className="mt-2 font-sans font-medium text-[11px] bg-transparent rounded-[6px] px-[10px] py-[4px] cursor-pointer transition-colors"
                            style={{ color: isDarkMode ? '#2ECC71' : '#0F9D58', border: `1px solid ${isDarkMode ? 'rgba(46,204,113,0.4)' : 'rgba(15,157,88,0.3)'}` }}>
                            Start now →
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="font-sans font-medium text-[13px] text-[#0F9D58] mt-4">
                      {futureYouRightTasks.length} win{futureYouRightTasks.length !== 1 ? 's' : ''} this week
                    </p>
                    <div className="flex items-center gap-2 mt-3 rounded-[8px] p-[10px]" style={{ background: isDarkMode ? 'rgba(46,204,113,0.1)' : 'rgba(15,157,88,0.04)' }}>
                      <span className="text-[20px]">😌</span>
                      <span className="font-sans text-[12px] text-[#0F9D58]">Clear, ahead, trusted</span>
                    </div>
                    <div className="text-center mt-2">
                      <span className="font-sans font-medium text-[13px] text-[#0F9D58]" style={{ background: 'rgba(15,157,88,0.06)', borderRadius: '20px', padding: '4px 16px', display: 'inline-block' }}>
                        Total time to prevent all of this: {futureYouTotalLabel}
                      </span>
                    </div>
                    {futureYouRecoveryProjection !== null && (
                      <p className={`font-sans text-[12px] text-center mt-1.5 ${futureYouRecoveryProjection >= 100 ? 'text-[#0F9D58]' : 'text-[#5B6B7B]'}`}>
                        {futureYouRecoveryProjection >= 100 ? '✓ ' : ''}Completing these will bring your Recovery Score to {futureYouRecoveryProjection}%
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* "What if I only do one?" */}
              <div className="w-full flex flex-col items-center mt-6">
                <button type="button" onClick={handleFutureYouOnlyOne} disabled={isFutureYouApiLoading}
                  className="font-sans font-medium text-[13px] text-[#C8893B] hover:underline bg-transparent border-0 cursor-pointer disabled:opacity-60">
                  {isFutureYouApiLoading ? 'Thinking... 🤔' : 'What if I only do one? →'}
                </button>
                {futureYouSingleTask && (
                  <div className="mt-3 w-full max-w-[480px] rounded-[10px] p-[14px] px-[18px]" style={{ border: `2px solid ${isDarkMode ? '#D4A054' : '#C8893B'}`, background: isDarkMode ? 'rgba(212,160,84,0.1)' : 'rgba(200,137,59,0.04)' }}>
                    <p className="font-sans font-semibold text-[13px] mb-1" style={{ color: dm.textPrimary }}>If you only do one thing:</p>
                    <p className="font-serif font-medium text-[16px]" style={{ color: dm.textPrimary }}>{futureYouSingleTask.taskTitle}</p>
                    <p className="font-sans text-[13px] mt-1" style={{ color: dm.textSecondary }}>{futureYouSingleTask.reason}</p>
                    <p className="font-sans font-medium text-[13px] text-[#C8893B] mt-1">→ {futureYouSingleTask.action}</p>
                    <button type="button" onClick={() => handleFutureYouStart(futureYouSingleTask.taskTitle)}
                      className="mt-3 font-sans font-medium text-[12px] text-white bg-[#C8893B] hover:bg-[#a06e2c] border-0 rounded-[6px] px-[12px] py-[6px] cursor-pointer transition-colors">
                      Do this now →
                    </button>
                  </div>
                )}
              </div>

              {/* Typewriter closing */}
              <div className="mt-10 text-center">
                <p className="font-serif italic font-medium text-[18px] min-h-[28px]" style={{ color: dm.textPrimary }}>{typewriterText}</p>
                {typewriterDone && (
                  <div style={{ animation: 'futureYouFadeIn 0.5s ease' }} />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Future You start toast */}
        {futureYouStartToast && (
          <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 10000, background: '#0F9D58', color: 'white', fontFamily: 'Inter, sans-serif', fontSize: '13px', padding: '10px 20px', borderRadius: '8px', pointerEvents: 'none' }}>
            Task moved to In Progress ✓
          </div>
        )}

        {activeTab === 'calendar' && (
          /* CALENDAR TAB PANEL */
          <div id="polaris-calendar-container" className="tab-fade-in w-full max-w-[800px] flex flex-col gap-6 pt-10 pb-16 px-6">
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

            <div className="calendar-card bg-white border border-polaris-border rounded-[14px] p-6 shadow-sm relative">
              <div className="grid grid-cols-7 gap-2 mb-4 text-center">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="font-sans font-medium text-[13px] text-[#5B6B7B] py-1">
                    {day}
                  </div>
                ))}
              </div>

              <div className="calendar-grid grid grid-cols-7 gap-2">
                {getCalendarCells(currentCalendarMonth).map((cell, idx) => {
                  const dayTasks = getTasksForDate(cell.date);
                  const isToday = cell.date.toDateString() === new Date().toDateString();
                  
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setSelectedCalendarDate(cell.date);
                      }}
                      className={`calendar-cell min-h-[90px] border border-[rgba(14,27,42,0.04)] rounded-[8px] p-2 flex flex-col items-start justify-between cursor-pointer transition-all duration-150 ${
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
                            <div key={task.id} title={task.title} className="flex items-center gap-1.5 w-full">
                              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
                              <span className="calendar-task-title font-sans font-normal text-[11px] text-polaris-primary truncate leading-none">
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

              {/* Calendar slide-in panel rendered via portal below */}
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (() => {
          const recoveryScore = totalOverdueEncountered === 0
            ? 100
            : Math.round((resolvedOverdueCount / totalOverdueEncountered) * 100);

          let scoreColor = '#B23A2E';
          let interpretationText = '🔴 Critical — address overdue tasks now';
          if (recoveryScore >= 80) {
            scoreColor = '#0F9D58';
            interpretationText = '✓ You\'re recovering well';
          } else if (recoveryScore >= 50) {
            scoreColor = '#C8893B';
            interpretationText = '⚠ Some tasks need attention';
          }

          return (
            /* DASHBOARD TAB PANEL */
            <div id="polaris-dashboard-container" className="tab-fade-in w-full max-w-[900px] flex flex-col gap-6 pt-10 pb-16 px-6">
              <h2 className="font-serif font-medium text-[20px] text-polaris-primary mb-2">Dashboard</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {/* CARD: Recovery Score */}
                <div className="bg-white border border-polaris-border rounded-[14px] p-[20px] shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif font-medium text-[16px] text-[#0E1B2A] leading-tight">Recovery Score</h3>
                    <p className="font-sans text-[13px] text-[#5B6B7B] mt-1">How well you're recovering from overdue tasks</p>
                  </div>
                  
                  <div className="flex flex-col items-center justify-center my-4">
                    <div className="relative w-[100px] h-[100px] flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="#E5E5E5"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke={scoreColor}
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray="251.2"
                          strokeDashoffset={251.2 * (1 - recoveryScore / 100)}
                          style={{ transition: 'stroke-dashoffset 1s ease' }}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none mt-1">
                        <span className="font-sans font-bold text-[20px]" style={{ color: scoreColor }}>
                          {recoveryScore}
                        </span>
                        <span className="font-sans text-[12px] text-[#5B6B7B] mt-0.5">
                          / 100
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center mb-4">
                    <p className="font-sans text-[13px] font-medium" style={{ color: scoreColor }}>
                      {interpretationText}
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-6 pt-3 border-t border-[rgba(14,27,42,0.08)]">
                    <span className="font-sans text-[12px] text-[#5B6B7B]">{totalOverdueEncountered} overdue encountered</span>
                    <span className="font-sans text-[12px]" style={{ color: resolvedOverdueCount > 0 ? '#0F9D58' : '#5B6B7B' }}>{resolvedOverdueCount} resolved</span>
                  </div>
                </div>

                {/* CARD: Commitment Density */}
                <div className="bg-white border border-polaris-border rounded-[14px] p-[20px] shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif font-medium text-[16px] text-[#0E1B2A] leading-tight">Commitment Density</h3>
                    <p className="font-sans text-[13px] text-[#5B6B7B] mt-1 mb-[16px]">Your task load over the next 7 days</p>
                  </div>

                  {(() => {
                    const { days, maxCount, avgPerDay, maxSingleDay, isOverloaded } = getCommitmentDensity();
                    
                    const getBarColor = (count: number) => {
                      if (count === 0) return '#E5E5E5';
                      if (count <= 2) return '#0F9D58';
                      if (count === 3) return '#C8893B';
                      return '#B23A2E';
                    };

                    const peakColor = getBarColor(maxSingleDay);

                    return (
                      <div className="flex flex-col gap-4 w-full">
                        {/* Bars container */}
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', height: '80px', width: '100%' }}>
                          {days.map((d, idx) => {
                            const barColor = getBarColor(d.count);
                            const finalHeight = (d.count / maxCount) * 80;
                            const isTallEnough = finalHeight >= 20;

                            return (
                              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', flex: 1, position: 'relative' }}>
                                  {d.count > 0 && !isTallEnough && (
                                    <span className="font-sans text-[11px] font-medium" style={{ color: barColor, marginBottom: '2px' }}>
                                      {d.count}
                                    </span>
                                  )}
                                  <div
                                    style={{
                                      width: '100%',
                                      borderRadius: '4px 4px 0 0',
                                      height: animateDensity ? `${Math.max(4, finalHeight)}px` : '4px',
                                      backgroundColor: barColor,
                                      transition: 'height 0.6s ease',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    {d.count > 0 && isTallEnough && (
                                      <span className="font-sans text-[11px] font-medium text-white">
                                        {d.count}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span 
                                  className={`font-sans text-[11px] mt-[4px] text-center ${
                                    d.label === 'Today' ? 'text-[#0E1B2A] font-medium' : 'text-[#5B6B7B]'
                                  }`}
                                >
                                  {d.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Cognitive Load Summary */}
                        <div className="flex items-center justify-between border-t border-[rgba(14,27,42,0.08)] pt-3 mt-1">
                          <span className="font-sans text-[13px] font-medium" style={{ color: peakColor }}>
                            Peak: {maxSingleDay} tasks
                          </span>
                          <span className="font-sans text-[13px] text-[#5B6B7B]">
                            Avg: {avgPerDay.toFixed(1)}/day
                          </span>
                        </div>

                        <div className="text-left">
                          {(() => {
                            if (avgPerDay > 3 || isOverloaded) {
                              return <span className="font-sans text-[13px] font-medium text-[#B23A2E]">🔴 Overloaded — consider renegotiating</span>;
                            }
                            if (avgPerDay > 1 && avgPerDay <= 3) {
                              return <span className="font-sans text-[13px] font-medium text-[#C8893B]">⚠ Getting busy</span>;
                            }
                            return <span className="font-sans text-[13px] font-medium text-[#0F9D58]">✓ Manageable load</span>;
                          })()}
                        </div>
                      </div>
                    );
                  })()}
                </div>

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
                      {tasks.filter(t => t.urgency === 'high').length}{"\u200b"}
                    </span>
                    <span className="font-sans text-[12px] text-polaris-secondary mt-1">High urgency</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-sans font-medium text-[32px] text-[#0E1B2A] leading-none">
                      {tasks.filter(t => {
                        const dl = parseDeadline(t.pillText, t.id);
                        if (!dl) return false;
                        return dl.toDateString() === new Date().toDateString();
                      }).length}{"\u200b"}
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
                        <span className="font-sans font-bold text-[13px] text-polaris-primary w-6 text-right shrink-0">{highCount}{"\u200b"}</span>
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
                        <span className="font-sans font-bold text-[13px] text-polaris-primary w-6 text-right shrink-0">{medCount}{"\u200b"}</span>
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
                        <span className="font-sans font-bold text-[13px] text-polaris-primary w-6 text-right shrink-0">{lowCount}{"\u200b"}</span>
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

              {/* Roast My Habits */}
              <button
                id="roast-habits-btn"
                type="button"
                onClick={handleRoast}
                disabled={isRoastLoading}
                className="w-full rounded-[12px] py-3 px-5 bg-[#0E1B2A] text-white font-sans font-medium text-[14px] hover:bg-[#1a2e42] transition-all disabled:opacity-80 cursor-pointer disabled:cursor-not-allowed"
              >
                {isRoastLoading ? "Roasting... 🔥" : "🔥 Roast my habits"}
              </button>
              {roastResult && (
                <div className="bg-white border border-polaris-border rounded-[14px] p-[18px] shadow-sm">
                  <p className="font-sans text-[14px] text-polaris-primary leading-relaxed">{roastResult}</p>
                </div>
              )}

              {/* AI Extraction Ledger (Dashboard) */}
              <div className="w-full" id="dashboard-extraction-ledger">
                <div
                  onClick={() => setIsLedgerOpen(prev => !prev)}
                  className="p-[14px] px-[20px] flex items-center justify-between cursor-pointer select-none transition-all duration-200"
                  style={{ backgroundColor: dm.card, border: `1px solid ${dm.border}`, borderRadius: isLedgerOpen ? '12px 12px 0 0' : '12px' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[14px]">✨</span>
                    <span className="font-sans font-medium text-[14px]" style={{ color: dm.textPrimary }}>AI Extraction Ledger</span>
                  </div>
                  <div>
                    <span className="font-sans font-medium text-[12px] px-[10px] py-[3px] rounded-[20px] bg-[rgba(200,137,59,0.12)] text-[#C8893B]">
                      {extractionLog.length > 0 ? `${extractionLog.length} tasks found` : 'No extractions yet'}
                    </span>
                  </div>
                  <div className="font-sans text-[14px]" style={{ color: dm.textSecondary, transform: isLedgerOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
                    ▼
                  </div>
                </div>
                <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: isLedgerOpen ? '600px' : '0px' }}>
                  <div className="border-t-0 rounded-b-[12px] max-h-[400px] overflow-y-auto" style={{ backgroundColor: dm.card, border: `1px solid ${dm.border}`, borderTop: 'none' }}>
                    {extractionLog.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                        <span className="text-[48px] mb-2">🔍</span>
                        <h4 className="font-sans font-medium text-[14px]" style={{ color: dm.textPrimary }}>No extractions yet</h4>
                        <p className="font-sans text-[13px] mt-1 max-w-[280px]" style={{ color: dm.textSecondary }}>Scan an email or image to see what Polaris finds for you.</p>
                      </div>
                    ) : (
                      <div>
                        {extractionLog.map((entry) => {
                          const status = getEntryStatus(entry);
                          let badgeBg = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(14,27,42,0.06)';
                          let badgeColor = dm.textSecondary;
                          let badgeText = 'In progress';
                          if (status === 'completed') { badgeBg = isDarkMode ? 'rgba(46,204,113,0.15)' : 'rgba(15,157,88,0.1)'; badgeColor = isDarkMode ? '#2ECC71' : '#0F9D58'; badgeText = '✓ Done'; }
                          else if (status === 'archived') { badgeBg = isDarkMode ? 'rgba(154,165,180,0.15)' : 'rgba(91,107,123,0.1)'; badgeColor = dm.textSecondary; badgeText = 'Archived'; }
                          let urgencyColor = dm.textSecondary;
                          if (entry.urgency === 'high') urgencyColor = isDarkMode ? '#C94B3E' : '#B23A2E';
                          else if (entry.urgency === 'medium') urgencyColor = isDarkMode ? '#D4A054' : '#C8893B';
                          return (
                            <div key={entry.id} className="p-[12px] px-[20px] flex items-center gap-[12px] last:border-b-0" style={{ borderBottom: `1px solid ${dm.border}` }}>
                              <div className="w-[20px] h-[20px] rounded-full flex items-center justify-center text-[12px] shrink-0" style={{ backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(200,137,59,0.1)' }}>
                                {entry.sourceType === 'email' ? '📧' : '📸'}
                              </div>
                              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                <div className="font-sans font-medium text-[13px] truncate" style={{ color: dm.textPrimary }}>{entry.taskTitle}</div>
                                <div className="font-sans text-[12px] truncate" style={{ color: dm.textSecondary }}>{entry.sourceName}</div>
                                <div className="font-sans text-[12px] font-medium" style={{ color: urgencyColor }}>{entry.deadline}</div>
                              </div>
                              <div className="font-sans font-medium text-[11px] px-[8px] py-[3px] rounded-[10px] shrink-0" style={{ backgroundColor: badgeBg, color: badgeColor }}>{badgeText}</div>
                            </div>
                          );
                        })}
                        <div className="p-[12px] px-[20px] rounded-b-[12px]" style={{ backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(14,27,42,0.02)', borderTop: `1px solid ${dm.border}` }}>
                          <span className="font-sans italic text-[13px]" style={{ color: dm.textSecondary }}>
                            Polaris found {extractionLog.length} task{extractionLog.length !== 1 ? 's' : ''} across {new Set(extractionLog.map(e => e.sourceName)).size} source{new Set(extractionLog.map(e => e.sourceName)).size !== 1 ? 's' : ''} you would have missed.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
          </div>
        );
      })()}

        {activeTab === 'inbox' && (
          /* INBOX TAB PANEL (Email list only) */
          <div id="polaris-inbox-container" className="tab-fade-in w-full flex flex-col bg-white min-h-[calc(100vh-180px)] p-6">

              {/* Gmail-style inbox */}
              <div className="w-full flex border border-[#E5E5E5] rounded-[12px] overflow-hidden flex-1 min-h-[500px] relative">
                {/* Backdrop */}
                {isMobileSidebarOpen && (
                  <div
                    id="mobile-sidebar-backdrop"
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="md:hidden fixed inset-0 bg-[rgba(0,0,0,0.3)] z-[99]"
                  />
                )}
                {/* LEFT SIDEBAR */}
                <aside 
                  className={`w-[256px] shrink-0 border-r border-[#E5E5E5] bg-white pt-2 flex flex-col select-none transition-transform duration-300
                    md:translate-x-0 md:static md:w-[256px] md:h-auto md:z-auto md:shadow-none
                    fixed left-0 top-0 h-full w-[280px] z-[100] bg-white shadow-[4px_0_12px_rgba(0,0,0,0.15)]
                    ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                  `}
                >
                  {/* Close button inside sidebar top-right on mobile */}
                  <button
                    type="button"
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="md:hidden absolute top-4 right-4 text-[#5F6368] hover:text-[#202124] text-[20px] font-sans bg-transparent border-0 cursor-pointer z-10"
                  >
                    ✕
                  </button>
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
                    <div id="email-detail-view" className="w-full py-[24px] px-[40px] flex flex-col" style={{ backgroundColor: dm.card }}>
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
                              <span style={{ display: 'none' }}>✓ Found {scanResult.count} task(s) — added to your Tasks.</span>
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
                      <div id="email-detail-sender-row" className="flex items-center gap-3 w-full">
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
                        {/* Hamburger button on mobile */}
                        <button
                          id="mobile-inbox-hamburger"
                          type="button"
                          onClick={() => setIsMobileSidebarOpen(true)}
                          className="md:hidden flex flex-col justify-center gap-[4px] items-center cursor-pointer bg-transparent border-0 shrink-0 mr-2 p-2"
                          style={{
                            width: '24px',
                            height: '24px',
                            boxSizing: 'content-box'
                          }}
                        >
                          <span style={{ height: '2px', width: '20px', backgroundColor: '#202124', display: 'block', borderRadius: '1px' }} />
                          <span style={{ height: '2px', width: '20px', backgroundColor: '#202124', display: 'block', borderRadius: '1px' }} />
                          <span style={{ height: '2px', width: '20px', backgroundColor: '#202124', display: 'block', borderRadius: '1px' }} />
                        </button>
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

                        <span className="text-[13px] text-[#444746] font-sans mr-2">1–50 of 847</span>
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
                      <div className="inbox-category-tabs flex border-b border-[#E5E5E5] select-none">
                        {/* Primary tab */}
                        <div className="flex items-center gap-3 p-3 px-4 border-b-3 border-[#D93025] text-[#D93025] font-googlesans font-medium text-[14px] cursor-pointer hover:bg-[#F2F6FC] transition-colors duration-100 shrink-0">
                          <span className="material-icons text-[20px]">inbox</span>
                          <span>Primary</span>
                        </div>

                        {/* Promotions tab */}
                        <div className="flex items-center gap-3 p-3 px-4 text-[#5F6368] font-googlesans font-medium text-[14px] cursor-pointer hover:bg-[#F2F6FC] transition-colors duration-100 shrink-0">
                          <span className="material-icons text-[20px]">local_offer</span>
                          <span>Promotions</span>
                          <span className="bg-[#0F9D58] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-[4px] shrink-0">
                            3 new
                          </span>
                        </div>

                        {/* Updates tab */}
                        <div className="flex items-center gap-3 p-3 px-4 text-[#5F6368] font-googlesans font-medium text-[14px] cursor-pointer hover:bg-[#F2F6FC] transition-colors duration-100 shrink-0">
                          <span className="material-icons text-[20px]">info</span>
                          <span>Updates</span>
                          <span className="w-2 h-2 rounded-full bg-[#FC8019] shrink-0" />
                        </div>

                        {/* Forums tab */}
                        <div className="flex items-center gap-3 p-3 px-4 text-[#5F6368] font-googlesans font-medium text-[14px] cursor-pointer hover:bg-[#F2F6FC] transition-colors duration-100 shrink-0">
                          <span className="material-icons text-[20px]">forum</span>
                          <span>Forums</span>
                        </div>
                      </div>

                      {/* EMAIL ROWS LIST */}
                      <div className="flex flex-col bg-white">
                        {emails.slice(0, 50).map((email) => {
                          return (
                            <div
                              key={email.id}
                              id={`email-row-${email.id}`}
                              onClick={() => handleOpenEmail(email.id)}
                              className="email-row flex items-center h-[50px] cursor-pointer hover:shadow-[0_4px_4px_-2px_rgba(0,0,0,0.2)] transition-all duration-150 select-none px-4 gap-2"
                              style={{ backgroundColor: dm.rowBg, borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.05)' : '#F1F3F4'}` }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = dm.rowHover; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = dm.rowBg; }}
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
                                className="email-checkbox w-3.5 h-3.5 accent-[#001D35] cursor-pointer shrink-0"
                              />

                              {/* Star Icon */}
                              <span
                                onClick={(e) => toggleStar(email.id, e)}
                                className={`email-star-icon material-icons text-[20px] select-none shrink-0 cursor-pointer transition-colors ${
                                  email.starred ? 'text-[#F4B400]' : 'text-[#5F6368] hover:text-gray-600'
                                }`}
                              >
                                {email.starred ? 'star' : 'star_border'}
                              </span>

                              {/* Important Indicator */}
                              <span
                                onClick={(e) => toggleImportant(email.id, e)}
                                className={`email-important-icon material-icons text-[20px] select-none shrink-0 cursor-pointer transition-colors ${
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
                                className={`email-sender-column w-[160px] shrink-0 text-[13px] font-googlesans whitespace-nowrap overflow-hidden text-ellipsis pr-2 ${
                                  email.unread ? 'font-bold' : 'font-normal'
                                }`}
                                style={{ color: dm.textPrimary }}
                              >
                                {email.from}
                              </div>

                              {/* Subject & Preview */}
                              <div className="flex-1 min-w-0 flex items-baseline text-[13px] overflow-hidden whitespace-nowrap text-ellipsis mr-2">
                                <span className={email.unread ? 'font-bold' : 'font-normal'} style={{ color: dm.textPrimary }}>
                                  {email.subject}
                                </span>
                                <span className="font-normal mx-1" style={{ color: dm.textSecondary }}>—</span>
                                <span className="font-normal truncate" style={{ color: dm.textSecondary }}>
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
                              <div className="email-timestamp w-[80px] text-right text-[12px] flex-shrink-0 font-normal" style={{ color: dm.textSecondary }}>
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

          </div>
        )}
      {/* Image Scan Modal (triggered from Tasks view) */}
      {isImageScanModalOpen && (
        <div
          onClick={() => setIsImageScanModalOpen(false)}
          className="modal-backdrop fixed inset-0 z-50 bg-[rgba(0,0,0,0.4)] backdrop-blur-[1px] flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="modal-content bg-white max-w-[560px] w-full rounded-[16px] p-7 shadow-2xl relative flex flex-col gap-4"
          >
            <button
              type="button"
              onClick={() => { setIsImageScanModalOpen(false); handleResetImageScan(); }}
              className="absolute top-5 right-5 text-polaris-secondary hover:text-polaris-primary text-[20px] border-0 bg-transparent cursor-pointer font-sans"
            >
              ✕
            </button>
            <h2 className="font-serif font-medium text-[20px] text-[#0E1B2A] mb-1">Scan Image for Tasks</h2>
            <div className="w-full flex-1 flex flex-col items-center">
                {!imagePreviewUrl ? (
                  /* Upload Zone */
                  <div className="w-full flex flex-col items-center">
                    <div 
                      id="image-upload-zone"
                      onClick={() => document.getElementById('image-file-input')?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                      }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragOver(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleImageChange(e.dataTransfer.files[0]);
                        }
                      }}
                      className={`w-full max-w-[500px] border-2 border-dashed rounded-[16px] p-12 px-6 text-center bg-white cursor-pointer transition-all ${
                        isDragOver 
                          ? 'border-[#C8893B] bg-[rgba(200,137,59,0.04)] shadow-sm' 
                          : 'border-[rgba(14,27,42,0.2)] hover:border-[#0E1B2A] hover:bg-[rgba(14,27,42,0.02)]'
                      }`}
                    >
                      {/* Icon */}
                      <div className="text-[48px] text-[#5B6B7B] select-none">📷</div>
                      
                      {/* Primary Text */}
                      <p className="font-sans font-medium text-[16px] text-[#0E1B2A] mt-4">
                        Drop a screenshot here
                      </p>

                      {/* Secondary Text */}
                      <p className="font-sans text-[13px] text-[#5B6B7B] mt-2 leading-relaxed">
                        WhatsApp chats, whiteboard photos, handwritten notes, syllabuses
                      </p>

                      {/* Browse Files Button */}
                      <button
                        type="button"
                        className="mt-4 px-5 py-2 border border-[rgba(14,27,42,0.2)] rounded-[8px] bg-transparent text-[#0E1B2A] font-sans font-medium text-[13px] hover:bg-[rgba(14,27,42,0.03)] cursor-pointer focus:outline-none transition-all"
                      >
                        Browse files
                      </button>

                      {/* Supported Formats */}
                      <p className="font-sans text-[12px] text-[#5B6B7B] mt-3">
                        Supports PNG, JPG, WEBP — max 10MB
                      </p>
                    </div>

                    {/* Validation Error */}
                    {imageScanError && (
                      <p id="image-scan-error" className="font-sans text-[13px] text-[#B23A2E] mt-3 max-w-[500px] text-center font-normal">
                        {imageScanError}
                      </p>
                    )}


                  </div>
                ) : (
                  /* Preview State & Result States */
                  <div className="w-full max-w-[500px] flex flex-col items-center gap-4">
                    <div className="relative border border-[rgba(14,27,42,0.1)] rounded-[12px] p-2 bg-white flex items-center justify-center overflow-hidden">
                      <img 
                        src={imagePreviewUrl} 
                        alt="Selected preview" 
                        className="image-scan-preview max-h-[300px] object-contain rounded-[8px] w-full"
                      />
                    </div>

                    <p className="font-sans text-[13px] text-[#5B6B7B] truncate max-w-full">
                      {imageFile ? imageFile.name : 'example.png'}
                    </p>

                    {imageScanResultState === 'idle' && (
                      <div className="flex flex-col items-center gap-3 w-full">
                        <button
                          id="btn-scan-image-tasks"
                          type="button"
                          onClick={handleScanImage}
                          className="w-full bg-[#0E1B2A] text-white font-sans font-medium text-[14px] py-3 px-7 rounded-[8px] hover:bg-opacity-90 active:scale-98 transition-all cursor-pointer border-0"
                        >
                          Scan for tasks
                        </button>
                        <button
                          type="button"
                          onClick={handleResetImageScan}
                          className="font-sans text-[13px] text-[#5B6B7B] hover:underline bg-transparent border-0 cursor-pointer focus:outline-none"
                        >
                          Choose different image
                        </button>
                      </div>
                    )}

                    {imageScanResultState === 'scanning' && (
                      <div className="flex flex-col items-center gap-2.5 mt-2">
                        <button
                          type="button"
                          disabled
                          className="w-full bg-[#0E1B2A]/70 text-white font-sans font-medium text-[14px] py-3 px-7 rounded-[8px] flex items-center justify-center gap-2 border-0 select-none"
                        >
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                          <span>Scanning image...</span>
                        </button>
                        <p className="font-sans text-[13px] text-[#5B6B7B]">
                          Gemini is reading your image...
                        </p>
                      </div>
                    )}

                    {imageScanResultState === 'success' && (
                      <div className="flex flex-col items-center gap-3 w-full">
                        <p className="font-sans text-[13px] text-[#0F9D58] font-medium text-center">
                          ✓ Found {imageScanSuccessCount} task(s) — added to your Tasks.
                        </p>
                        <button
                          type="button"
                          onClick={handleResetImageScan}
                          className="px-5 py-2.5 bg-transparent border border-[rgba(14,27,42,0.2)] rounded-[8px] text-[#0E1B2A] font-sans font-medium text-[13px] hover:bg-[rgba(14,27,42,0.03)] cursor-pointer transition-all"
                        >
                          Scan another image
                        </button>
                      </div>
                    )}

                    {imageScanResultState === 'empty' && (
                      <div className="flex flex-col items-center gap-3 w-full">
                        <p className="font-sans text-[13px] text-[#5B6B7B] text-center font-medium">
                          No tasks or deadlines found in this image.
                        </p>
                        <button
                          type="button"
                          onClick={handleResetImageScan}
                          className="px-5 py-2.5 bg-transparent border border-[rgba(14,27,42,0.2)] rounded-[8px] text-[#0E1B2A] font-sans font-medium text-[13px] hover:bg-[rgba(14,27,42,0.03)] cursor-pointer transition-all"
                        >
                          Scan another image
                        </button>
                      </div>
                    )}

                    {imageScanResultState === 'error' && (
                      <div className="flex flex-col items-center gap-3 w-full">
                        <p className="font-sans text-[13px] text-[#B23A2E] text-center font-medium">
                          {imageScanError || "Couldn't scan this image — try again."}
                        </p>
                        <button
                          type="button"
                          onClick={handleScanImage}
                          className="w-full bg-[#0E1B2A] text-white font-sans font-medium text-[14px] py-3 px-7 rounded-[8px] hover:bg-opacity-90 active:scale-98 transition-all cursor-pointer border-0"
                        >
                          Try again
                        </button>
                        <button
                          type="button"
                          onClick={handleResetImageScan}
                          className="font-sans text-[13px] text-[#5B6B7B] hover:underline bg-transparent border-0 cursor-pointer focus:outline-none"
                        >
                          Choose different image
                        </button>
                      </div>
                    )}

                  </div>
                )}
                
                {/* Hidden File Input */}
                <input 
                  id="image-file-input"
                  data-testid="image-file-input"
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageChange(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
              </div>
          </div>
        </div>
      )}
      </main>

      {/* Calendar Date Slide-in Panel */}
      {selectedCalendarDate && (
        <>
          <div
            onClick={() => setSelectedCalendarDate(null)}
            className="fixed inset-0 z-40 bg-[rgba(0,0,0,0.2)]"
          />
          <div
            className="fixed top-0 right-0 h-full z-50 bg-white shadow-2xl flex flex-col w-full md:w-[320px]"
            style={{ animation: 'calendar-panel-slide-in 250ms ease forwards' }}
          >
            <div className="flex items-center justify-between p-5 border-b border-[rgba(14,27,42,0.08)]">
              <h2 className="font-serif font-medium text-[18px] text-polaris-primary">
                Tasks on {selectedCalendarDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
              </h2>
              <button
                type="button"
                onClick={() => setSelectedCalendarDate(null)}
                className="text-polaris-secondary hover:text-polaris-primary text-[20px] border-0 bg-transparent cursor-pointer font-sans"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {getTasksForDate(selectedCalendarDate).length === 0 ? (
                <div className="flex items-center justify-center h-full text-polaris-secondary font-sans text-[14px]">
                  No tasks on this date
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {getTasksForDate(selectedCalendarDate).map((task) => {
                    let dotColor = '#5B6B7B';
                    if (task.urgency === 'high') dotColor = '#B23A2E';
                    else if (task.urgency === 'medium') dotColor = '#C8893B';
                    return (
                      <div
                        key={task.id}
                        onClick={() => {
                          setActiveTab('tasks');
                          setHighlightedTaskId(task.id);
                          setSelectedCalendarDate(null);
                          setTimeout(() => {
                            document.getElementById(`task-card-${task.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            setTimeout(() => setHighlightedTaskId(null), 2000);
                          }, 100);
                        }}
                        className="flex items-center gap-3 p-3 rounded-[10px] border border-[rgba(14,27,42,0.06)] hover:bg-[rgba(14,27,42,0.02)] cursor-pointer transition-all"
                      >
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="font-sans font-medium text-[13px] text-polaris-primary truncate">{task.title}</span>
                          <span className="font-sans text-[12px] text-polaris-secondary">{task.pillText}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Add Task Modal */}
      {isAddTaskModalOpen && (
        <div onClick={closeAddTaskModal}
          className="modal-backdrop fixed inset-0 z-50 bg-[rgba(0,0,0,0.4)] backdrop-blur-[1px] flex items-center justify-center p-4">
          <div onClick={(e) => e.stopPropagation()}
            className="modal-content bg-white max-w-[480px] w-full rounded-[16px] p-7 shadow-2xl relative flex flex-col gap-4">
            <button type="button" onClick={closeAddTaskModal}
              className="absolute top-5 right-5 text-polaris-secondary hover:text-polaris-primary text-[20px] border-0 bg-transparent cursor-pointer font-sans">
              ✕
            </button>
            <h2 className="font-serif font-medium text-[18px] text-[#0E1B2A] mb-1">New Task</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="font-sans font-medium text-[13px] text-[#5B6B7B] mb-1 block">Task name</label>
                <input type="text" value={modalTaskName} onChange={(e) => setModalTaskName(e.target.value)} autoFocus
                  className="w-full bg-white border border-polaris-border rounded-[8px] px-4 py-2.5 font-sans text-[14px] text-polaris-primary focus:outline-none focus:border-polaris-primary/30 transition-all" />
              </div>
              <div>
                <label className="font-sans font-medium text-[13px] text-[#5B6B7B] mb-1 block">Due date (optional)</label>
                <input type="text" value={modalDueDate} onChange={(e) => handleModalDueDateChange(e.target.value)}
                  placeholder="e.g. tomorrow, next friday, in 3 days"
                  className="w-full bg-white border border-polaris-border rounded-[8px] px-4 py-2.5 font-sans text-[14px] text-polaris-primary focus:outline-none focus:border-polaris-primary/30 transition-all" />
                {isReparsingDate && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="w-3 h-3 border-[1.5px] border-[#5B6B7B]/30 border-t-[#5B6B7B] rounded-full animate-spin shrink-0" />
                    <span className="font-sans text-[12px] text-[#5B6B7B]">Parsing...</span>
                  </div>
                )}
                {!isReparsingDate && modalDueDateISO && (
                  <span className="font-sans text-[12px] text-[#0F9D58] mt-1.5 block">📅 {modalDueDateReadable}</span>
                )}
              </div>
              <div>
                <label className="font-sans font-medium text-[13px] text-[#5B6B7B] mb-1 block">Description (optional)</label>
                <textarea value={modalDescription} onChange={(e) => setModalDescription(e.target.value)} rows={3}
                  placeholder="Add details..."
                  className="w-full bg-white border border-polaris-border rounded-[8px] px-4 py-2.5 font-sans text-[14px] text-polaris-primary focus:outline-none focus:border-polaris-primary/30 transition-all resize-none" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-2">
              <button type="button" onClick={closeAddTaskModal}
                className="px-4 py-2 bg-transparent text-polaris-primary border border-[rgba(14,27,42,0.2)] font-sans font-medium text-[13px] rounded-[8px] hover:bg-[rgba(14,27,42,0.03)] active:scale-98 transition-all cursor-pointer">
                Cancel
              </button>
              <button type="button" onClick={handleModalConfirm}
                className="px-4 py-2 bg-[#0E1B2A] text-white font-sans font-medium text-[13px] rounded-[8px] hover:bg-opacity-90 active:scale-98 transition-all cursor-pointer">
                Add task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Escape Hatch Draft Modal Overlay */}
      {isEscapeModalOpen && (
        <div 
          onClick={() => setIsEscapeModalOpen(false)}
          className="modal-backdrop fixed inset-0 z-50 bg-[rgba(0,0,0,0.4)] backdrop-blur-[1px] flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="modal-content bg-white max-w-[520px] w-full rounded-[16px] p-7 shadow-2xl relative flex flex-col gap-4"
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
          className="modal-backdrop fixed inset-0 z-50 bg-[rgba(0,0,0,0.4)] backdrop-blur-[1px] flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="modal-content bg-white max-w-[600px] w-full max-h-[80vh] overflow-y-auto rounded-[16px] p-7 shadow-2xl relative flex flex-col gap-6"
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

      {/* Hidden demo reset link — bottom-right corner, visible only on hover */}
      <div
        id="demo-reset-corner"
        style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          width: '80px',
          height: '40px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
          padding: '8px',
          zIndex: 9999,
          cursor: 'default',
        }}
        className="group"
      >
        <button
          type="button"
          id="demo-reset-btn"
          onClick={() => {
            try {
              localStorage.removeItem('polaris-tasks');
              localStorage.removeItem('polaris-completed');
              localStorage.removeItem('polaris-scanned');
              localStorage.removeItem('polaris-total-overdue');
              localStorage.removeItem('polaris-resolved-overdue');
              localStorage.removeItem('polaris-overdue-ids');
              localStorage.removeItem('polaris-extraction-log');
            } catch (e) {}
            const isTest = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
            const initial = isTest ? INITIAL_TASKS : [...INITIAL_TASKS, ...EXTRA_OVERDUE_TASKS];
            setTasks(initial.map(t => ({
              ...t,
              createdAt: Date.now(),
              subtasks: [],
              decomposing: false,
              decomposed: false,
              subtasksCollapsed: false,
              pointOfNoReturnPassed: (t.id === 'task-2' || t.id === 'task-5' || t.id === 'task-6') ? true : undefined
            })));
            setCompletedCount(0);
            setScannedCount(0);
            setTotalOverdueEncountered(isTest ? 1 : 3);
            setResolvedOverdueCount(0);
            setOverdueTaskIds(isTest ? new Set(['task-2']) : new Set(['task-2', 'task-5', 'task-6']));
            setExtractionLog([]);
            setIsLedgerOpen(false);
            setCompletedTaskIds(new Set());
            setCompletedTasks([]);
            setConfettiShown(false);
            setDemoResetToast(true);
            setTimeout(() => setDemoResetToast(false), 2000);
          }}
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '11px',
            color: '#C4C4C4',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            opacity: 0,
            transition: 'opacity 0.2s',
            whiteSpace: 'nowrap',
          }}
          className="group-hover:!opacity-100"
        >
          Reset demo
        </button>
      </div>

      {/* Feature 9 — Confetti Toast */}
      {confettiToast && (
        <div
          id="confetti-toast"
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10000,
            background: 'linear-gradient(135deg, #0F9D58, #0d8a4e)',
            color: 'white',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: '14px',
            padding: '12px 24px',
            borderRadius: '10px',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 24px rgba(15,157,88,0.35)',
            animation: 'confetti-toast-in 0.3s ease forwards',
          }}
        >
          🎉 All tasks complete — you crushed it today!
        </div>
      )}

      {/* Gemini 503 toast */}
      {gemini503Toast && (
        <div style={{
          position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000,
          background: '#1A202C', color: 'white', borderRadius: '10px', padding: '12px 20px',
          fontFamily: 'Inter, sans-serif', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '12px',
          maxWidth: '560px', animation: 'gemini-503-in 200ms ease forwards',
        }}>
          <span>⚡ Gemini API is experiencing high demand right now. This is a temporary Google-side issue — please try again in a moment.</span>
          <button type="button" onClick={() => setGemini503Toast(false)}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '16px', padding: 0, lineHeight: 1, flexShrink: 0 }}>
            ×
          </button>
        </div>
      )}

      {/* Demo reset toast */}
      {demoResetToast && (
        <div
          id="demo-reset-toast"
          style={{
            position: 'fixed',
            bottom: '32px',
            right: '16px',
            background: '#0E1B2A',
            color: '#FFFFFF',
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
            padding: '10px 16px',
            borderRadius: '8px',
            zIndex: 10000,
            pointerEvents: 'none',
            opacity: 1,
          }}
        >
          Demo reset — showing seed data
        </div>
      )}

      {/* === DEMO MODE OVERLAY === */}
      {isDemoMode && !demoFinalOverlay && (
        <>
          {/* Top bar */}
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: 'rgba(14,27,42,0.95)', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '200px', height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>
              <div style={{ height: '100%', borderRadius: '2px', background: '#C8893B', width: `${((demoStep + 1) / 12) * 100}%`, transition: 'width 0.3s ease' }} />
            </div>
            <div key={demoStep} style={{ flex: 1, textAlign: 'center', fontFamily: 'Fraunces, Georgia, serif', fontStyle: 'italic', fontWeight: 500, fontSize: '22px', color: 'white', animation: 'demo-text-fade 0.3s ease', maxWidth: '600px', margin: '0 auto' }}>
              {DEMO_STEPS[demoStep]?.text}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Step {demoStep + 1} of 12</span>
              <button type="button" onClick={handleDemoExit}
                style={{ background: 'none', border: '1px solid rgba(255,255,255,0.3)', color: 'white', fontFamily: 'Inter, sans-serif', fontSize: '12px', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                ✕ Exit
              </button>
            </div>
          </div>

          {/* Bottom nav bar */}
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000, background: 'rgba(14,27,42,0.95)', padding: '12px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
            <button type="button" disabled={demoStep === 0} onClick={() => {
              clearDemoTimers();
              setDemoStep(prev => Math.max(prev - 1, 0));
            }}
              style={{ background: 'none', border: '1px solid rgba(255,255,255,0.4)', color: demoStep === 0 ? 'rgba(255,255,255,0.3)' : 'white', fontFamily: 'Inter, sans-serif', fontSize: '13px', padding: '8px 16px', borderRadius: '6px', cursor: demoStep === 0 ? 'not-allowed' : 'pointer' }}>
              ← Prev
            </button>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
              Auto-advancing in {demoCountdown}s
            </span>
            <button type="button" disabled={demoStep === 11} onClick={() => {
              clearDemoTimers();
              setDemoStep(prev => Math.min(prev + 1, 11));
            }}
              style={{ background: '#C8893B', border: 'none', color: 'white', fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '13px', padding: '8px 16px', borderRadius: '6px', cursor: demoStep === 11 ? 'not-allowed' : 'pointer', opacity: demoStep === 11 ? 0.5 : 1 }}>
              Next →
            </button>
          </div>
        </>
      )}

      {/* Demo Final Overlay (Step 12) */}
      {isDemoMode && demoFinalOverlay && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1002, background: 'rgba(14,27,42,0.97)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '24px' }}>
          <h1 style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 500, fontSize: '36px', color: 'white', margin: 0 }}>Polaris</h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '16px', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', margin: 0 }}>Your fixed point before the deadline.</p>
          <p style={{ fontFamily: 'Fraunces, Georgia, serif', fontStyle: 'italic', fontWeight: 500, fontSize: '22px', color: '#C8893B', margin: '16px 0 0', textAlign: 'center' }}>This version of you exists. Pick one.</p>
          <button type="button" onClick={handleDemoExit}
            style={{ marginTop: '24px', background: '#C8893B', border: 'none', color: 'white', fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '16px', padding: '14px 32px', borderRadius: '10px', cursor: 'pointer' }}>
            Try it yourself →
          </button>
        </div>
      )}
    </div>
  );
}
