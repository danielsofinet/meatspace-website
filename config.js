/*
 * MEATSPACE website settings: the only file you need to edit for links and sign-ups.
 */
window.MEATSPACE = {
  // Your Steam store page. Replace once the app page is live.
  steamUrl: "https://store.steampowered.com/app/000000/MEATSPACE/",

  // YouTube video ID: the part after "watch?v=" (e.g. "dQw4w9WgXcQ").
  // Leave it empty and the video block shows a "trailer soon" poster.
  youtubeId: "",

  // Early-access sign-up. The form POSTs straight to your mailing-list provider,
  // so emails are stored there (not on GitHub) and the provider sends the welcome mail.
  //
  //   Kit (kit.com, free up to 10,000 subscribers):
  //     action:     "https://app.kit.com/forms/YOUR_FORM_ID/subscriptions"
  //     emailField: "email_address"
  //
  //   Buttondown:
  //     action:     "https://buttondown.com/api/emails/embed-subscribe/YOUR_USERNAME"
  //     emailField: "email"
  //
  //   MailerLite / Google Forms work the same way: paste the form's POST URL and field name.
  signup: {
    action: "",
    emailField: "email_address",
  },

  socials: {
    youtube: "",
    discord: "",
    x: "",
  },
};
