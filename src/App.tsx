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

export default function App() {
  const [activeTab, setActiveTab] = useState<'tasks' | 'calendar' | 'dashboard' | 'inbox'>('tasks');
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
      return INITIAL_TASKS.map(t => ({
        ...t,
        createdAt: Date.now(),
        subtasks: [],
        decomposing: false,
        decomposed: false,
        subtasksCollapsed: false
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

  // States for Multimodal Image Scanning
  const [inboxSubTab, setInboxSubTab] = useState<'emails' | 'scan'>('emails');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageScanError, setImageScanError] = useState<string | null>(null);
  const [isImageScanning, setIsImageScanning] = useState(false);
  const [imageScanResultState, setImageScanResultState] = useState<'idle' | 'scanning' | 'success' | 'empty' | 'error'>('idle');
  const [imageScanSuccessCount, setImageScanSuccessCount] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

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
        throw new Error('Image scan response not OK');
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
          setImageScanSuccessCount(newTasks.length);
          setImageScanResultState('success');
        }
      } else {
        throw new Error('Invalid scan result format');
      }
    } catch (error) {
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

  // Persist tasks and counts to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem('polaris-tasks', JSON.stringify(tasks));
      localStorage.setItem('polaris-completed', JSON.stringify(completedCount));
      localStorage.setItem('polaris-scanned', JSON.stringify(scannedCount));
    } catch (e) {
      // storage full or unavailable — fail silently, never crash
    }
  }, [tasks, completedCount, scannedCount]);

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
          /* INBOX TAB PANEL (Pixel-perfect Gmail clone with image scan toggle) */
          <div id="polaris-inbox-container" className="w-full flex flex-col bg-white min-h-[calc(100vh-180px)] p-6">
            
            {/* Toggle Row */}
            <div className="flex justify-center gap-2 select-none mb-6">
              <button
                id="toggle-inbox-emails"
                type="button"
                onClick={() => setInboxSubTab('emails')}
                className={`px-5 py-2 rounded-[20px] font-sans font-medium text-[13px] transition-all cursor-pointer ${
                  inboxSubTab === 'emails'
                    ? 'bg-[#0E1B2A] text-white border-0 font-sans'
                    : 'bg-transparent text-[#5B6B7B] border border-[rgba(14,27,42,0.2)] hover:bg-[rgba(14,27,42,0.03)] font-sans'
                }`}
              >
                📧 Emails
              </button>
              <button
                id="toggle-inbox-scan"
                type="button"
                onClick={() => setInboxSubTab('scan')}
                className={`px-5 py-2 rounded-[20px] font-sans font-medium text-[13px] transition-all cursor-pointer ${
                  inboxSubTab === 'scan'
                    ? 'bg-[#0E1B2A] text-white border-0 font-sans'
                    : 'bg-transparent text-[#5B6B7B] border border-[rgba(14,27,42,0.2)] hover:bg-[rgba(14,27,42,0.03)] font-sans'
                }`}
              >
                📸 Scan Image
              </button>
            </div>

            {inboxSubTab === 'emails' ? (
              /* Existing Gmail-style inbox */
              <div className="w-full flex border border-[#E5E5E5] rounded-[12px] overflow-hidden flex-1 min-h-[500px]">
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
                        {emails.slice(0, 50).map((email) => {
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
            ) : (
              /* SCAN IMAGE VIEW */
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

                    {/* Try Demo Example Link */}
                    <div className="mt-4">
                      <button
                        id="btn-try-demo"
                        type="button"
                        onClick={handleTryDemoExample}
                        className="font-sans text-[13px] text-[#C8893B] hover:underline bg-transparent border-0 cursor-pointer focus:outline-none"
                      >
                        ✨ Try an example →
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Preview State & Result States */
                  <div className="w-full max-w-[500px] flex flex-col items-center gap-4">
                    <div className="relative border border-[rgba(14,27,42,0.1)] rounded-[12px] p-2 bg-white flex items-center justify-center overflow-hidden">
                      <img 
                        src={imagePreviewUrl} 
                        alt="Selected preview" 
                        className="max-h-[300px] object-contain rounded-[8px] w-full"
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
            )}

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
            } catch (e) {}
            setTasks(INITIAL_TASKS.map(t => ({
              ...t,
              createdAt: Date.now(),
              subtasks: [],
              decomposing: false,
              decomposed: false,
              subtasksCollapsed: false
            })));
            setCompletedCount(0);
            setScannedCount(0);
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
    </div>
  );
}
