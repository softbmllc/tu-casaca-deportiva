// src/components/InstagramFeed.tsx
export default function InstagramFeed() {
    return (
      <section className="bg-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-center mb-10">
            Seguinos en Instagram
          </h2>
          <iframe
            src="https://cdn.lightwidget.com/widgets/90a6ca70492c59d18799004dbb546748.html"
            title="Instagram Feed"
            scrolling="no"
            allowTransparency={true}
            className="w-full border-0 overflow-hidden"
            style={{ height: "750px" }}
          ></iframe>
        </div>
      </section>
    );
  }