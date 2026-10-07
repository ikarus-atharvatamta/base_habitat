import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LayoutSection from "./LayoutSection";
import ColorSwatchSection from "./ColorSwatchSection";
import OptionCard from "./OptionCard";

export const TitleSection = ({ className = "" }) => (
  <section className={`flex flex-col gap-6 ${className}`}>
    <h2 className="text-[28px] md:text-[32px] font-normal leading-tight tracking-tight text-charcoal">
      Design your Base
    </h2>
    <div className="flex flex-col gap-5">
      <p className="text-[18px] md:text-[20px] text-muted-gray font-normal leading-relaxed">
        Your space, your story. Personalize your Base model
with our curated design packages and other add-ons.
      </p>
    </div>
  </section>
);

const RightPanel = ({
  config = {},
  onColorChange,
  onSidingChange,
  onRoofChange,
  onWindowMaterialChange,
  onBedChange,
  onCabinetChange,
  onLayoutChange,
  onDeckChange,
  onCounterTopChange,
  onCouchChange,
  onLightingChange,
  onWardrobeChange,
  lightSettings,
  setLightSettings,
  activeLightControls,
  availableLights,
  onCopyConfig,
  onToneMappingChange,
  onToneMappingExposureChange,
  onViewModeChange
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isBasePlus = location.pathname === "/basehabitat/plus";

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

      {/* Choose Base Option */}
      <section className="flex flex-col gap-6">
        <h3 className="select-none text-xl font-normal tracking-tight">
          Choose your Model
        </h3>
        <OptionCard
          title="Base 1"
          subtitle="Studio - 1 Bed, 1 Bathroom, 1 Sleeping Loft 1 Sleeping Loft – 960 sq ft"
          selected={!isBasePlus}
          onClick={() => navigate("/basehabitat")}
        >
          <a href="https://basehabitation.com/en/" target="_blank" rel="noreferrer" className="text-sm underline underline-offset-2 hover:text-charcoal/80" onClick={(e) => e.stopPropagation()}>
            See website
          </a>
        </OptionCard>
        <OptionCard
          title="Base 1+"
          subtitle="Studio - 1 Bed, 1 Bathroom, 1-2 Bed, 1 Sleeping loft 1-2 Bed, 1 Sleeping loft – 1200 sq ft"
          selected={isBasePlus}
          onClick={() => navigate("/basehabitat/plus")}
        >
          <a href="https://basehabitation.com/en/" target="_blank" rel="noreferrer" className="text-sm underline underline-offset-2 hover:text-charcoal/80" onClick={(e) => e.stopPropagation()}>
            See website
          </a>
        </OptionCard>
      </section>

      {/* Exterior Section */}
      <section className="flex flex-col gap-8">
        {/* Main Heading */}
        <div className="border-b border-[#505050] pb-2">
          <h2 className="select-none text-[28px] md:text-[32px] font-normal leading-tight tracking-tight text-charcoal">
            Exterior
          </h2>
        </div>

        {/* Design Package */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h3 className="select-none text-xl font-normal tracking-tight text-charcoal">
              Choose your exterior design package
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-8 pt-1">
            {/* Ranger */}
            <div 
              onClick={() => onColorChange("dark")}
              className="flex flex-col items-start gap-4 cursor-pointer select-none group"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 mx-auto flex items-center justify-center shrink-0">
                <div 
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-full border border-black/5 shadow-inner transition-all duration-300 ${
                    config.sidingColor === "dark" && config.roofColor === "dark"
                      ? "outline outline-1 outline-offset-[6px] outline-charcoal" 
                      : "hover:scale-[1.03]"
                  }`}
                  style={{
                    backgroundImage: `url(${import.meta.env.BASE_URL}icons/ranger.webp)`,
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                  }}
                />
              </div>
              <div className="flex flex-col gap-1 w-full text-left">
                <h4 className={`text-lg font-normal tracking-tight transition-colors duration-300 ${
                  config.sidingColor === "dark" && config.roofColor === "dark"
                    ? "text-charcoal" 
                    : "text-charcoal/50"
                }`}>Ranger</h4>
                <p className={`text-sm leading-normal font-normal transition-colors duration-300 ${
                  config.sidingColor === "dark" && config.roofColor === "dark"
                    ? "text-[#4a4a4a]" 
                    : "text-subtext-gray/70"
                }`}>
                  Dark wood siding, dark roof & wood-pvc windows.
                </p>
              </div>
            </div>

            {/* Scout */}
            <div 
              onClick={() => onColorChange("light")}
              className="flex flex-col items-start gap-4 cursor-pointer select-none group"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 mx-auto flex items-center justify-center shrink-0">
                <div 
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-full border border-black/5 shadow-inner transition-all duration-300 ${
                    config.sidingColor === "light" && config.roofColor === "light"
                      ? "outline outline-1 outline-offset-[6px] outline-charcoal" 
                      : "hover:scale-[1.03]"
                  }`}
                  style={{
                    backgroundImage: `url(${import.meta.env.BASE_URL}icons/scout.webp)`,
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                  }}
                />
              </div>
              <div className="flex flex-col gap-1 w-full text-left">
                <h4 className={`text-lg font-normal tracking-tight transition-colors duration-300 ${
                  config.sidingColor === "light" && config.roofColor === "light"
                    ? "text-charcoal" 
                    : "text-charcoal/50"
                }`}>Scout</h4>
                <p className={`text-sm leading-normal font-normal transition-colors duration-300 ${
                  config.sidingColor === "light" && config.roofColor === "light"
                    ? "text-[#4a4a4a]" 
                    : "text-subtext-gray/70"
                }`}>
                  Light wood siding, light roof & aluminium windows.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Siding Color Selection */}
        <div className="flex flex-col gap-4">
          <h4 className="select-none text-xl font-normal tracking-tight text-charcoal">
            Choose your siding color
          </h4>
          <div className="flex flex-col gap-3">
            <OptionCard
              title="Wood - Dark"
              subtitle='Vertical 6" V-joint - Opaque finish - Brushed spruce'
              swatchColor="#3c3c3c"
              swatchRound={true}
              selected={config.sidingColor === "dark"}
              onClick={() => onSidingChange("dark")}
            />
            <OptionCard
              title="Wood - Light"
              subtitle='Vertical 6" V-joint - Lifetime finish - Sanded spruce'
              swatchColor="#ebe7ca"
              swatchRound={true}
              selected={config.sidingColor === "light"}
              onClick={() => onSidingChange("light")}
            />
          </div>
        </div>

        {/* Roof Color Selection */}
        <div className="flex flex-col gap-4">
          <h4 className="select-none text-xl font-normal tracking-tight text-charcoal">
            Choose your roof color
          </h4>
          <div className="flex flex-col gap-3">
            <OptionCard
              title="Steel - Light"
              subtitle='16" panels - Raised joint - Hidden fasteners'
              swatchColor="#d3d3d3"
              swatchRound={true}
              selected={config.roofColor === "light"}
              onClick={() => onRoofChange("light")}
            />
            <OptionCard
              title="Steel - Dark"
              subtitle='16" panels - Raised joint - Hidden fasteners'
              swatchColor="#3c3c3c"
              swatchRound={true}
              selected={config.roofColor === "dark"}
              onClick={() => onRoofChange("dark")}
            />

          </div>
        </div>

        {/* Window Material Selection */}
        <div className="flex flex-col gap-4">
          <h4 className="select-none text-xl font-normal tracking-tight text-charcoal">
            Choose your window material
          </h4>
          <div className="flex flex-col gap-3">
            <OptionCard
              title="Wood-PVC"
              subtitle="High-performance, tripled-glazed windows – NZP"
              swatchColor="#ac936e"
              swatchRound={true}
              selected={config.windowMaterial === "wood-pvc"}
              onClick={() => onWindowMaterialChange("wood-pvc")}
            />
            <OptionCard
              title="Galvanized Aluminium"
              subtitle="Triple-glazed aluminium windows – Alumilex"
              swatchColor="#d4d4d4"
              swatchRound={true}
              selected={config.windowMaterial === "galvanized-aluminium"}
              onClick={() => onWindowMaterialChange("galvanized-aluminium")}
            />
          </div>
        </div>
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

      
      {/* Interior Section */}
      <section className="flex flex-col gap-8 bg-[#f7f7f0] p-8 rounded-[32px]">
        {/* Main Heading */}
        <div className="border-b border-[#e2e2e2] pb-2">
          <h2 className="select-none text-[28px] md:text-[32px] font-normal leading-tight tracking-tight text-charcoal">
            Interior
          </h2>
        </div>

        {/* Kitchen Design Package */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <h3 className="select-none text-xl font-normal tracking-tight text-charcoal">
              Chose your kitchen design package
            </h3>
            <p className="text-sm text-subtext-gray select-none leading-normal font-normal">
              Same quality, two different moods. Both are designed for compact-yet-generous efficiency.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 pt-1">
            {/* Stripped Down */}
            <div 
              onClick={() => { onCabinetChange("stripped"); onViewModeChange?.("interior"); }}
              className="flex flex-col items-start gap-4 cursor-pointer select-none group"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 mx-auto flex items-center justify-center shrink-0">
                <div 
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-full border border-black/5 shadow-inner transition-all duration-300 ${
                    config.selectedCabinet === "stripped"
                      ? "outline outline-1 outline-offset-[6px] outline-charcoal" 
                      : "hover:scale-[1.03]"
                  }`}
                  style={{
                    backgroundImage: `url(${import.meta.env.BASE_URL}icons/stripped.webp)`,
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                  }}
                />
              </div>
              <div className="flex flex-col gap-1 w-full text-left">
                <h4 className={`text-lg font-normal tracking-tight transition-colors duration-300 ${
                  config.selectedCabinet === "stripped"
                    ? "text-charcoal" 
                    : "text-charcoal/50"
                }`}>Stripped Down</h4>
                <p className={`text-sm leading-normal font-normal transition-colors duration-300 ${
                  config.selectedCabinet === "stripped"
                    ? "text-[#4a4a4a]" 
                    : "text-subtext-gray/70"
                }`}>
                  Open cabinets & stainless steel accents.
                </p>
              </div>
            </div>

            {/* Classic */}
            <div 
              onClick={() => { onCabinetChange("full"); onViewModeChange?.("interior"); }}
              className="flex flex-col items-start gap-4 cursor-pointer select-none group"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 mx-auto flex items-center justify-center shrink-0">
                <div 
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-full border border-black/5 shadow-inner transition-all duration-300 ${
                    config.selectedCabinet === "full"
                      ? "outline outline-1 outline-offset-[6px] outline-charcoal" 
                      : "hover:scale-[1.03]"
                  }`}
                  style={{
                    backgroundImage: `url(${import.meta.env.BASE_URL}icons/classic.webp)`,
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                  }}
                />
              </div>
              <div className="flex flex-col gap-1 w-full text-left">
                <h4 className={`text-lg font-normal tracking-tight transition-colors duration-300 ${
                  config.selectedCabinet === "full"
                    ? "text-charcoal" 
                    : "text-charcoal/50"
                }`}>Classic</h4>
                <p className={`text-sm leading-normal font-normal transition-colors duration-300 ${
                  config.selectedCabinet === "full"
                    ? "text-[#4a4a4a]" 
                    : "text-subtext-gray/70"
                }`}>
                  Closed cabinets, tile backsplash and quartz countertop. Complete with a larger wooden island countertop.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

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
            onClick={() => { onBedChange("Mezzanine_king"); onViewModeChange?.("interior"); }}
          />
          <OptionCard
            title="Base Bunk Bed"
            subtitle="1 Double bed and 1 single bed & extra play area"
            selected={config.selectedBed === "Mezzanine_Bunk"}
            onClick={() => { onBedChange("Mezzanine_Bunk"); onViewModeChange?.("interior"); }}
          />
        </div>
      </section>

      
      {/* counter top option */}
      <section className="flex flex-col gap-6">
        <h3 className="text-xl font-normal tracking-tight">
          Choose your Counter Top
        </h3>
        <div className="flex flex-col gap-4">
          <OptionCard
            title="Stainless Steel"
            // subtitle="Kitchen base only"
            selected={config.selectedCounterTop === "stainless_steel"}
            onClick={() => { onCounterTopChange("stainless_steel"); onViewModeChange?.("interior"); }}
          />
          <OptionCard
            title="Wood Island"
            // subtitle="Kitchen with cabinet doors"
            selected={config.selectedCounterTop === "wood_island"}
            onClick={() => { onCounterTopChange("wood_island"); onViewModeChange?.("interior"); }}
          />
        </div>
      </section>

      {/* Additional Options */}
      <section className="flex flex-col gap-8">
        {/* Main Heading */}
        <div className="border-b border-[#505050] pb-2">
          <h2 className="select-none text-[28px] md:text-[32px] font-normal leading-tight tracking-tight text-charcoal">
            Exterior Upgrades
          </h2>
        </div>
        <div className="flex flex-col gap-4">
          <OptionCard
            title="Base Deck"
            subtitle='1/2" Corugaled steel - Exposed fasteners'
            selected={config.deckSelection===true}
            onClick={()=>onDeckChange(!config.deckSelection)}
          />
          <OptionCard
            title="The bigger deck"
            subtitle=""
            selected={false}
            onClick={() => {}}
          />
        </div>
      </section>

      {/* Add-ons Section */}
      <section className="flex flex-col gap-6">
        {/* Main Heading */}
        <div className="border-b border-[#505050] pb-2">
          <h2 className="select-none text-[28px] md:text-[32px] font-normal leading-tight tracking-tight text-charcoal">
            Add-ons
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          <OptionCard
            title="Journey Couch, Coffee Table & Stools (2)"
            subtitle="Designed in collaboration with Mitz Takahashi"
            selected={config.couchSelection === true}
            onClick={() => { onCouchChange(!config.couchSelection); onViewModeChange?.("interior"); }}
          />
          <OptionCard
            title="Custom Base Lighting"
            subtitle="Wall sconces and island light – Produced by Hamster Lighting"
            selected={config.customLighting === true}
            onClick={() => { onLightingChange(!config.customLighting); onViewModeChange?.("interior"); }}
          />
          {isBasePlus && (
            <OptionCard
              title="Built-in wardrobe (Base 1+ only)"
              subtitle='16" panels - Raised joint - Hidden fasteners'
              selected={config.wardrobeSelection === true}
              onClick={() => { onWardrobeChange(!config.wardrobeSelection); onViewModeChange?.("interior"); }}
            />
          )}

          {activeLightControls && activeLightControls.length > 0 && (
            <div className="flex flex-col gap-4 mt-4 p-4 border rounded-xl border-black/5 bg-white/50">
              <h3 className="text-[18px] font-medium tracking-tight text-charcoal">
                Global Renderer Settings
              </h3>
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-normal tracking-tight text-charcoal">Tone Mapping</label>
                <select 
                  value={config.toneMapping ?? 0} 
                  onChange={(e) => onToneMappingChange?.(parseInt(e.target.value))}
                  className="p-2 border border-black/10 rounded-lg bg-white outline-none focus:border-black/30"
                >
                  <option value={0}>No Tone Mapping</option>
                  <option value={1}>Linear</option>
                  <option value={2}>Reinhard</option>
                  <option value={3}>Cineon</option>
                  <option value={4}>ACES Filmic</option>
                  <option value={6}>AgX</option>
                  <option value={7}>Neutral</option>
                </select>
              </div>
              <div className="flex flex-col gap-2 mt-2">
                <div className="flex justify-between text-xs text-subtext-gray items-center">
                  <label className="text-[14px] font-normal tracking-tight text-charcoal">Exposure</label>
                  <input 
                    type="number"
                    min="0"
                    step="0.1"
                    value={config.toneMappingExposure ?? 1.0}
                    onChange={(e) => onToneMappingExposureChange?.(parseFloat(e.target.value) || 0)}
                    className="w-16 p-1 border border-black/10 rounded text-right bg-white text-charcoal outline-none focus:border-black/30"
                  />
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="5" 
                  step="0.05" 
                  value={config.toneMappingExposure ?? 1.0} 
                  onChange={(e) => onToneMappingExposureChange?.(parseFloat(e.target.value) || 0)}
                  className="w-full accent-[#e54d42]"
                />
                {config.toneMapping === 0 && (
                  <span className="text-[10px] text-[#e54d42] leading-tight mt-1">
                    * Exposure has no effect when "No Tone Mapping" is selected. Please select a tone mapping algorithm above.
                  </span>
                )}
              </div>
            </div>
          )}

          {activeLightControls && activeLightControls.length > 0 && activeLightControls.map(modelName => {
            const lightsInfo = availableLights?.[modelName];
            if (!lightsInfo || lightsInfo.length === 0) {
              return (
                <div key={`light-controls-${modelName}`} className="flex flex-col gap-4 mt-4 p-4 border rounded-xl border-black/5 bg-white/50">
                  <h3 className="text-[18px] font-medium tracking-tight text-charcoal">
                    {modelName}
                  </h3>
                  <p className="text-sm text-subtext-gray">No lights found in this model.</p>
                </div>
              );
            }

            return (
              <div key={`light-controls-${modelName}`} className="flex flex-col gap-6 mt-4 p-4 border rounded-xl border-black/5 bg-white/50">
                <h3 className="text-[18px] font-medium tracking-tight text-charcoal">
                  {modelName} Light Controls
                </h3>
                
                {lightsInfo.map((light, index) => {
                  const intensityVal = lightSettings?.[modelName]?.[light.id]?.intensity ?? (light.defaultMultiplier !== undefined ? light.defaultMultiplier : 1);
                  const colorVal = lightSettings?.[modelName]?.[light.id]?.color ?? light.defaultColor;

                  console.log(`[DEBUG] UI Slider for ${modelName} -> ${light.name}:`, {
                    intensityVal, 
                    colorVal, 
                    defaultMultiplier: light.defaultMultiplier, 
                    defaultColor: light.defaultColor,
                    lightSettingsForId: lightSettings?.[modelName]?.[light.id]
                  });
                  const rangeVal = lightSettings?.[modelName]?.[light.id]?.range ?? light.defaultDistance;

                  return (
                    <div key={light.id} className="flex flex-col gap-3 p-3 border rounded-lg border-black/5 bg-white">
                      <h4 className="text-[15px] font-medium tracking-tight text-charcoal">
                        {light.name} <span className="text-xs text-subtext-gray font-normal">({light.type})</span>
                      </h4>
                      
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-xs text-subtext-gray items-center">
                          <span>Intensity</span>
                          <input 
                            type="number"
                            min="0"
                            step="0.1"
                            value={intensityVal}
                            onChange={(e) => setLightSettings(prev => ({
                              ...prev,
                              [modelName]: {
                                ...(prev[modelName] || {}),
                                [light.id]: { 
                                  ...(prev[modelName]?.[light.id] || {}), 
                                  intensity: parseFloat(e.target.value) || 0 
                                }
                              }
                            }))}
                            className="w-16 p-1 border border-black/10 rounded text-right bg-white text-charcoal outline-none focus:border-black/30"
                          />
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="10" 
                          step="0.1" 
                          value={intensityVal} 
                          onChange={(e) => setLightSettings(prev => ({
                            ...prev,
                            [modelName]: {
                              ...(prev[modelName] || {}),
                              [light.id]: { ...(prev[modelName]?.[light.id] || {}), intensity: parseFloat(e.target.value) }
                            }
                          }))}
                          className="w-full accent-[#e54d42]"
                        />
                      </div>



                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[14px] font-normal tracking-tight text-charcoal">
                          Color
                        </span>
                        <input 
                          type="color" 
                          value={colorVal} 
                          onChange={(e) => setLightSettings(prev => ({
                            ...prev,
                            [modelName]: {
                              ...(prev[modelName] || {}),
                              [light.id]: { ...(prev[modelName]?.[light.id] || {}), color: e.target.value }
                            }
                          }))}
                          className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </section>

      {/* Let's make it happen Section */}
      <section className="flex flex-col gap-8">
        {/* Main Heading */}
        <div className="border-b border-[#505050] pb-2">
          <h2 className="select-none text-[28px] md:text-[32px] font-normal leading-tight tracking-tight text-charcoal">
            Let's make it happen
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          {/* Need a break */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xl font-normal tracking-tight text-charcoal">
              Need a break?
            </h4>
            <p className="text-sm text-subtext-gray leading-relaxed font-normal">
              Save your configuration link and come back at any time.
            </p>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); onCopyConfig(); }}
              className="text-sm text-charcoal underline hover:text-[#e54d42] font-normal transition-colors"
            >
              Copy configuration link
            </a>
          </div>

          {/* Have questions */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xl font-normal tracking-tight text-charcoal">
              Have questions?
            </h4>
            <p className="text-sm text-subtext-gray leading-relaxed font-normal">
              Talk to one of our experts to get answers or support.
            </p>
            <a 
              className="text-sm text-charcoal underline hover:text-[#e54d42] font-normal transition-colors"
            >
              Talk to us
            </a>
          </div>
        </div>
      </section>

      {/* Continue Button */}
      <div className="flex w-full pt-4 pb-12 justify-center">
        <button 
          className="w-full md:w-auto px-12 py-3 bg-[#e54d42] text-white rounded-full text-lg font-medium hover:bg-[#d43d32] transition-colors cursor-pointer text-center"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default RightPanel;
