import customtkinter as ctk
import tkinter as tk
from PIL import Image, ImageTk, ImageDraw
import os
from tkinter import filedialog, messagebox

# --- আধুনিক UI থিম সেটআপ ---
ctk.set_appearance_mode("Dark")  # মোড: "System" (standard), "Dark", "Light"
ctk.set_default_color_theme("blue")  # থিম: "blue" (standard), "green", "dark-blue"

class FabricGeneratorApp(ctk.CTk):
    def __init__(self):
        super().__init__()

        # অ্যাপের উইন্ডো সেটআপ
        self.title("Gingham Fabric Generator for Customizer Canvas")
        self.geometry("700x500")

        # generated_image hold করার জন্য একটি ভেরিয়েবল
        self.final_image = None
        self.tile_size = 512 # ডিফল্ট সিমলেস টাইল সাইজ

        # --- UI লেআউট ---
        # বাম পাশের প্যানেল (কন্ট্রোলস)
        self.control_frame = ctk.CTkFrame(self, width=200, corner_radius=10)
        self.control_frame.pack(side="left", fill="y", padx=20, pady=20)

        self.label_title = ctk.CTkLabel(self.control_frame, text="ফেব্রিক কন্ট্রোল", font=("Arial", 18, "bold"))
        self.label_title.pack(pady=20)

        self.btn_generate = ctk.CTkButton(self.control_frame, text="ফেব্রিক তৈরি করুন", command=self.generate_and_display)
        self.btn_generate.pack(pady=15, padx=20)

        self.btn_save = ctk.CTkButton(self.control_frame, text="ইমেজ সেভ করুন", command=self.save_image, state="disabled")
        self.btn_save.pack(pady=15, padx=20)

        self.label_info = ctk.CTkLabel(self.control_frame, text="সিমলেস ফেব্রিক টেলর ক্যানভাসের জন্য", wraplength=160)
        self.label_info.pack(side="bottom", pady=20)

        # ডান পাশের প্যানেল (প্রিভিউ)
        self.preview_frame = ctk.CTkFrame(self, corner_radius=10)
        self.preview_frame.pack(side="right", fill="both", expand=True, padx=(0, 20), pady=20)

        self.preview_label = ctk.CTkLabel(self.preview_frame, text="প্রিভিউ এখানে দেখা যাবে", font=("Arial", 16))
        self.preview_label.pack(expand=True)

    # --- ফেব্রিক জেনারেট করার লজিক (The Core Function) ---
    def create_gingham_tile(self, size):
        # রিয়ালিস্টিক কালার (একদম পিওর হোয়াইট বা ব্ল্যাক নয়)
        C_WHITE = (245, 245, 245)
        C_BLACK = (25, 25, 25)
        
        # গ্রে কালার ক্যালকুলেশন (বুনন ইফেক্ট এর জন্য)
        C_GREY = tuple(int((w + b) / 2) for w, b in zip(C_WHITE, C_BLACK))

        q = size // 2
        img = Image.new("RGBA", (size, size))
        draw = ImageDraw.Draw(img)

        # ১. বেসিক চেক প্যাটার্ন তৈরি
        draw.rectangle([0, 0, q, q], fill=C_WHITE)          # টপ-লেফট সাদা
        draw.rectangle([q, q, size, size], fill=C_BLACK)    # বটম-রাইট কালো
        draw.rectangle([q, 0, size, q], fill=C_GREY)        # টপ-রাইট গ্রে
        draw.rectangle([0, q, q, size], fill=C_GREY)        # বটম-লেফট গ্রে

        # ২. রিয়ালিস্টিক সুতার বুনন (Weave Pattern) নয়েজ যোগ করা
        # এটি সিমলেস করার জন্য বিশেষভাবে ডিজাইন করা
        img_weave = img.copy()
        pixels_weave = img_weave.load()

        for y in range(size):
            for x in range(size):
                # সুতার ক্রস বুনন রিয়ালিস্টিক করার জন্য পিক্সেল অল্টারনেট করা
                # একটি র্যান্ডম ইফেক্ট কিন্তু যা সিমলেসনেস বজায় রাখে
                weave_mask = 1 if (x + y) % 2 == 0 else 0
                weave_intensity = 15 # কতটুকু বুনন স্পষ্ট হবে
                
                # চুরির সাদা বা কালোর সাথে মিলিয়ে নয়েজ যোগ করা
                r, g, b, a = pixels_weave[x, y]
                
                # বেসিক নয়েজ ম্যাজিক
                if a > 0: # শুধু দৃশ্যমান অংশে কাজ করবে
                    # চুরির কালার এবং ক্রস-বুনন মিলিয়ে নয়েজ নিয়ন্ত্রণ
                    noise = (x * 3 + y * 7) % 31
                    
                    if (x % 2 == weave_mask and y % 2 == (1 - weave_mask)):
                        # একটি সুতার টোন (হালকা)
                        r = min(255, max(0, r + noise // 3))
                        g = min(255, max(0, g + noise // 3))
                        b = min(255, max(0, b + noise // 3))
                    else:
                        # অন্য সুতার টোন (গাঢ়)
                        r = min(255, max(0, r - noise // 4))
                        g = min(255, max(0, g - noise // 4))
                        b = min(255, max(0, b - noise // 4))

                    pixels_weave[x, y] = (r, g, b, a)

        return img_weave

    # --- UI তে প্রিভিউ আপডেট ---
    def generate_and_display(self):
        # ফেব্রিক তৈরি করুন
        self.final_image = self.create_gingham_tile(self.tile_size)

        # UI তে দেখানোর জন্য ছোট ভার্সন তৈরি (resize to fit preview box)
        preview_size = 400
        preview_img = self.final_image.resize((preview_size, preview_size), Image.Resampling.LANCZOS)
        
        # PIL ইমেজকে Tkinter ফরম্যাটে কনভার্ট
        self.tk_image = ImageTk.PhotoImage(preview_img)

        # প্রিভিউ লেবেলে আপডেট
        self.preview_label.configure(image=self.tk_image, text="")
        
        # সেভ বাটন অ্যাক্টিভ করুন
        self.btn_save.configure(state="normal")
        # messagebox.showinfo("সফল", "ফেব্রিক জেনারেট করা হয়েছে!")

    # --- কম্পিউটার এ ইমেজ সেভ করা ---
    def save_image(self):
        if self.final_image is None:
            messagebox.showerror("এরর", "প্রথমে ফেব্রিক তৈরি করুন।")
            return

        # সেভ ডায়ালগ বক্স ওপেন
        file_path = filedialog.asksaveasfilename(
            defaultextension=".png",
            filetypes=[("PNG Image", "*.png"), ("JPEG Image", "*.jpg")],
            title="ফেব্রিক সেভ করুন",
            initialfile="seamless_gingham_fabric.png"
        )

        if file_path:
            try:
                # যদি jpg তে সেভ করতে চায় তবে RGBA থেকে RGB তে কনভার্ট করতে হবে
                if file_path.lower().endswith(('.jpg', '.jpeg')):
                    rgb_img = self.final_image.convert('RGB')
                    rgb_img.save(file_path, quality=95)
                else:
                    self.final_image.save(file_path) # png তেই RGBA সেভ হবে
                
                messagebox.showinfo("সফল", f"ফেব্রিকটি এখানে সেভ করা হয়েছে:\n{file_path}")
            except Exception as e:
                messagebox.showerror("ভুল", f"সেভ করার সময় সমস্যা হয়েছে:\n{e}")

# অ্যাপ রান করুন
if __name__ == "__main__":
    app = FabricGeneratorApp()
    app.mainloop()