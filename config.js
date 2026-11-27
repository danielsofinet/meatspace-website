/*
 * MEATSPACE website settings: the only file you need to edit for links and sign-ups.
 */
window.MEATSPACE = {
  // Your Steam store page. Replace once the app page is live.
  steamUrl: "https://store.steampowered.com/app/000000/MEATSPACE/",

  // The full video that opens full screen from the hero's play button.
  // GitHub Pages refuses files over 100 MB: re-encode bigger videos first (see README).
  demoVideo: "assets/video/meatspace-demo.mp4",

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
