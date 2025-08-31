// counter.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://obqmgqzjtvdzmcfvteyn.supabase.co',
  'sb_publishable_Jjxl5hlVxOj1IeucdHKeXw_noPg319G'
);


export const Counter = {
  user: null,
  uploadCount: 0,
  MAX_UPLOADS: 0,
  uploadCounterText: null,
  guestUploadMessage: null,
  // uploadButton and urlInput are no longer needed here
  // as the listener is in main.js

  async init() {
      this.uploadCounterText = document.getElementById("uploadCounterText");
      this.guestUploadMessage = document.getElementById("guestUploadMessage");
      // We still need to access these elements for UI updates.
      this.uploadButton = document.getElementById("uploadButton");

      try {
          const {
              data
          } = await supabase.auth.getSession();
          if (data.session?.user) this.user = data.session.user;
      } catch (err) {
          console.error("Error fetching session:", err);
      }

      // 5 uploads per month for logged in users, 1 for guests
      this.MAX_UPLOADS = this.user ? 5 : 1;
      await this.fetchCount();
      this.updateUI();
  },

  async handleUpload(type) {
      if (!this.canUpload()) {
          alert(this.user ?
              `You have reached your monthly limit of ${this.MAX_UPLOADS}.` :
              "Guest uploads exhausted. Please sign up to continue.");
          return;
      }

      this.uploadCount++;

      if (this.user) {
          await supabase
              .from("profiles")
              .update({
                  monthly_uploads_count: this.uploadCount
              })
              .eq("id", this.user.id);
      } else {
          localStorage.setItem("guestUploadCount", this.uploadCount);
      }

      console.log(`Upload recorded (${type}). New count: ${this.uploadCount}`);
      this.updateUI();
  },

  async fetchCount() {
      if (this.user) {
          const {
              data,
              error
          } = await supabase
              .from("profiles")
              .select("monthly_uploads_count")
              .eq("id", this.user.id)
              .single();
          if (!error && data) this.uploadCount = data.monthly_uploads_count || 0;
      } else {
          this.uploadCount = parseInt(localStorage.getItem("guestUploadCount")) || 0;
      }
  },

  updateUI() {
      const remaining = this.MAX_UPLOADS - this.uploadCount;
      if (this.uploadCounterText) this.uploadCounterText.textContent = `Uploads left: ${remaining}`;

      if (!this.user && remaining <= 0) {
          this.uploadCounterText.classList.add("alert");
          if (this.guestUploadMessage) this.guestUploadMessage.style.display = "block";
          if (this.uploadButton) this.uploadButton.disabled = true;
      } else {
          this.uploadCounterText.classList.remove("alert");
          if (this.guestUploadMessage) this.guestUploadMessage.style.display = "none";
          if (this.uploadButton) this.uploadButton.disabled = false;
      }
  },

  canUpload() {
      return this.uploadCount < this.MAX_UPLOADS;
  }
};