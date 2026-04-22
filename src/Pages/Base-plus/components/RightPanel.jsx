import React from "react";
import LayoutSection from "./LayoutSection";
import ColorSwatchSection from "./ColorSwatchSection";
import OptionCard from "./OptionCard";

export const TitleSection = ({ className = "" }) => (
  <section className={`flex flex-col gap-6 ${className}`}>
    <h2 className="text-[28px] md:text-[32px] font-normal leading-tight tracking-tight text-charcoal">
      Design your Cabin
    </h2>
    <div className="flex flex-col gap-5">
      <p className="text-[18px] md:text-[20px] text-muted-gray font-normal leading-relaxed">
        Make it yours. From layout to cladding and other options.
      </p>
    </div>
  </section>
);

const RightPanel = ({
  config = {},
  onColorChange,
  onBedChange,
  onCabinetChange,
  onLayoutChange,
  onDeckChange,
  onCounterTopChange
}) => {
  return (
    <div className=" px-10 pt-[36px] pb-12 md:px-[15%] xl:px-[27.5%] md:pt-[80px] md:pb-16 flex flex-col gap-12 w-full mx-auto">
      {/* Title Section (Desktop Only in this panel) */}
      <div className="hidden md:block">
        <TitleSection />
      </div>

      {/* Layout Selection */}
      {/* <LayoutSection
                selected={config.selectedLayout}
                onChange={onLayoutChange}
                
            /> */}

      {/* Cladding Color */}
      <section className="flex flex-col gap-6">
        <h3 className="select-none text-xl font-normal tracking-tight">
          Choose your Cladding
        </h3>
        <OptionCard
          title="Ranger"
          subtitle="Dark wood, Dark roof and wooden windows"
          swatchColor="#1c1515"
          selected={config.selectedColor === "dark"}
          onClick={() => onColorChange("dark")}
        />
        <OptionCard
          title="Scout"
          subtitle="Light wood, Lightroof and Aluminium windows"
          swatchColor="#e7d9d3"
          selected={config.selectedColor === "light"}
          onClick={() => onColorChange("light")}
        />
      </section>

      {/* <ColorSwatchSection
        title="Choose your cladding color"
        options={[
          {
            id: "light",
            color: "#e3c5b8",
            name: "Bone white",
            description: "A warm and simple white. Classic.",
          },
          {
            id: "dark",
            color: "#262424",
            name: "Cloud gray",
            description: "Light, airy neutral gray.",
          },
        ]}
        selectedId={config.selectedColor}
        onChange={onColorChange}
      /> */}

      {/* Bed Type */}
      <section className="flex flex-col gap-6">
        <h3 className="text-xl font-normal tracking-tight">
         Mezzanine upgrades
        </h3>
        <div className="flex flex-col gap-4">
          <OptionCard
            title=" King Size Bed"
            subtitle="King size comfort"
            selected={config.selectedBed === "Mezzanine_king"}
            onClick={() => onBedChange("Mezzanine_king")}
          />
          <OptionCard
            title="Base Bunk Bed"
            subtitle="1 Double bed and 1 single bed & extra play area"
            selected={config.selectedBed === "Mezzanine_Bunk"}
            onClick={() => onBedChange("Mezzanine_Bunk")}
          />
        </div>
      </section>

      {/* Interior Cabinet Style */}
      <section className="flex flex-col gap-6">
        <h3 className="text-xl font-normal tracking-tight">
          Choose your Interior Cabinet Style
        </h3>
        <div className="flex flex-col gap-4">
          <OptionCard
            title="Stripped Down"
            subtitle="Kitchen base only"
            selected={config.selectedCabinet === "stripped"}
            onClick={() => onCabinetChange("stripped")}
          />
          <OptionCard
            title="Full"
            subtitle="Kitchen with cabinet doors"
            
            selected={config.selectedCabinet === "full"}
            onClick={() => onCabinetChange("full")}
          />
        </div>
      </section>

       <section className="flex flex-col gap-6">
        <h3 className="text-xl font-normal tracking-tight">
          Choose your Counter Top
        </h3>
        <div className="flex flex-col gap-4">
          <OptionCard
            title="Stainless Steel"
            // subtitle="Kitchen base only"
            selected={config.selectedCounterTop === "stainless_steel"}
            onClick={() => {onCounterTopChange("stainless_steel") }}
          />
          <OptionCard
            title="Wood Island"
            // subtitle="Kitchen with cabinet doors"

            selected={config.selectedCounterTop === "wood_island"}
            onClick={() => { onCounterTopChange("wood_island") }}
          />
        </div>
      </section>

      {/* Additional Options */}
      <section className="flex flex-col gap-6 mb-12">
        <h3 className="text-xl font-normal tracking-tight">
          Choose your Additional Options
        </h3>
        <div className="flex flex-col gap-4">
          <OptionCard
            title="Wooden Deck"
            subtitle="5' x 5'"
            selected={config.deckSelection===true}
            onClick={()=>onDeckChange(!config.deckSelection)}
          />
        </div>
      </section>
    </div>
  );
};

export default RightPanel;
