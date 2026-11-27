/*
 * MEATSPACE website settings: the only file you need to edit for links and sign-ups.
 */
window.MEATSPACE = {
  // Your Steam store page. Replace once the app page is live.
  steamUrl: "https://store.steampowered.com/app/000000/MEATSPACE/",

  // The full video that opens full screen from the hero's play button.
  // demoVideo is AV1 (small, sharp); browsers that can't decode AV1 get demoVideoFallback (H.264).
  // The hero background plays the same two files: if you rename them, update the hero <video> in index.html too.
  // GitHub Pages refuses files over 100 MB: re-encode bigger videos first (see README).
  demoVideo: "assets/video/meatspace-demo-av1.mp4",
  demoVideoFallback: "assets/video/meatspace-demo-h264.mp4",

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
