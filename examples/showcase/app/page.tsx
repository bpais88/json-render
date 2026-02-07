import Link from "next/link";

const examples = [
  {
    name: "Comic Strip",
    href: "/comic",
    description:
      "AI generates comic panels with dialogue, narration, and sound effects",
    color: "from-orange-500/20 to-red-500/20",
    border: "border-orange-500/30",
  },
  {
    name: "Wireframes",
    href: "/wireframes",
    description:
      "Low-fidelity UI mockups with forms, tables, navigation, and layouts",
    color: "from-gray-500/20 to-slate-500/20",
    border: "border-gray-500/30",
  },
  {
    name: "Mermaid Diagrams",
    href: "/mermaid",
    description:
      "Flowcharts, sequence diagrams, ERDs, state machines, and more",
    color: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-500/30",
  },
  {
    name: "Text Adventure",
    href: "/adventure",
    description:
      "Interactive fiction game with choices, inventory, and branching stories",
    color: "from-amber-500/20 to-yellow-500/20",
    border: "border-amber-500/30",
  },
  {
    name: "Slide Deck",
    href: "/slides",
    description:
      "Presentation slides with keyboard navigation and fullscreen mode",
    color: "from-purple-500/20 to-indigo-500/20",
    border: "border-purple-500/30",
  },
  {
    name: "Flowchart",
    href: "/diagrams",
    description:
      "Interactive node diagrams with auto-layout, powered by ReactFlow + Dagre",
    color: "from-emerald-500/20 to-teal-500/20",
    border: "border-emerald-500/30",
  },
  {
    name: "Video",
    href: "/remotion",
    description: "AI-generated video timelines rendered with Remotion",
    color: "from-pink-500/20 to-rose-500/20",
    border: "border-pink-500/30",
  },
  {
    name: "Pixel Art",
    href: "/pixel",
    description:
      "Retro pixel art from prompts — characters, items, and scenes on a constrained grid",
    color: "from-lime-500/20 to-green-500/20",
    border: "border-lime-500/30",
  },
  {
    name: "Infographic",
    href: "/infographic",
    description:
      "Data-driven visual stories with stats, charts, timelines, and callouts",
    color: "from-sky-500/20 to-blue-500/20",
    border: "border-sky-500/30",
  },
  {
    name: "Generative Art",
    href: "/generative-art",
    description:
      "Abstract SVG compositions — shapes, curves, and color palettes from your imagination",
    color: "from-fuchsia-500/20 to-violet-500/20",
    border: "border-fuchsia-500/30",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="text-xs font-mono text-white/40 mb-4">
            @json-render
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tighter mb-4">
            json-render
          </h1>
          <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
            Define a component catalog. Users prompt. AI generates structured
            JSON constrained to your schema. Your renderers display it.
          </p>
        </div>

        {/* Examples grid */}
        <div className="grid sm:grid-cols-2 gap-4">
          {examples.map((ex) => (
            <Link
              key={ex.href}
              href={ex.href}
              className={`group block p-6 rounded-xl border ${ex.border} bg-gradient-to-br ${ex.color} hover:scale-[1.02] transition-all duration-200`}
            >
              <h2 className="text-lg font-semibold mb-2 group-hover:text-white transition-colors">
                {ex.name}
              </h2>
              <p className="text-sm text-white/50 leading-relaxed">
                {ex.description}
              </p>
              <div className="mt-4 text-xs font-mono text-white/30 group-hover:text-white/50 transition-colors">
                /{ex.href.slice(1)} &rarr;
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center">
          <div className="text-xs text-white/20 font-mono">
            built with json-render + claude
          </div>
        </footer>
      </div>
    </div>
  );
}
