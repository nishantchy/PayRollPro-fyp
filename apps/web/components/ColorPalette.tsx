import React from "react";

export function ColorPalette() {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Elegant Purple Palette</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ColorCard
          name="Royal Purple"
          value="#8E44AD"
          className="bg-royal-purple text-light-neutral"
          description="Primary color"
        />

        <ColorCard
          name="Deep Slate"
          value="#2C3E50"
          className="bg-deep-slate text-light-neutral"
          description="Secondary color"
        />

        <ColorCard
          name="Golden Amber"
          value="#F39C12"
          className="bg-golden-amber text-deep-slate"
          description="Accent color"
        />

        <ColorCard
          name="Light Neutral"
          value="#F8F9FA"
          className="bg-light-neutral text-deep-slate border border-gray-200"
          description="Neutral color"
        />
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Usage Examples</h3>
        <div className="space-y-4">
          <div className="flex gap-2">
            <button className="bg-royal-purple text-light-neutral px-4 py-2 rounded">
              Primary Button
            </button>
            <button className="bg-deep-slate text-light-neutral px-4 py-2 rounded">
              Secondary Button
            </button>
            <button className="bg-golden-amber text-deep-slate px-4 py-2 rounded">
              Accent Button
            </button>
          </div>

          <div className="bg-light-neutral p-4 rounded border border-golden-amber">
            <p className="text-deep-slate">
              Content area with light neutral background and golden amber border
            </p>
          </div>

          <div className="bg-deep-slate p-4 rounded">
            <p className="text-light-neutral">
              Dark content area with{" "}
              <span className="text-golden-amber">accent text highlight</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ColorCardProps {
  name: string;
  value: string;
  className: string;
  description: string;
}

function ColorCard({ name, value, className, description }: ColorCardProps) {
  return (
    <div className={`rounded-lg p-4 ${className}`}>
      <div className="flex flex-col h-full justify-between">
        <div>
          <h3 className="font-semibold text-lg">{name}</h3>
          <p className="opacity-80">{value}</p>
        </div>
        <p className="mt-2 text-sm">{description}</p>
      </div>
    </div>
  );
}
