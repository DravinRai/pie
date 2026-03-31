import re
import os

filepath = r'd:\Project_02\pie-landing-page\styles.css'
with open(filepath, 'r', encoding='utf-8') as f:
    css = f.read()

# 1. Update font-families
css = css.replace("font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;", "font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;")
css = css.replace("font-family: 'Cormorant Garamond', Georgia, serif;", "font-family: 'Playfair Display', serif;")

# 2. Add New Palette & Update original variables mapped to new palette
new_vars = """    /* Minimalist B&W Palette */
    --bg-base:        #FFFFFF;
    --bg-alt:         #F5F5F7;
    --text-main:      #000000;
    --text-muted:     #86868B;
    --accent:         #000000;

    /* Semantic mappings */
    --earth-abyss:    var(--bg-base);
    --earth-deep:     var(--bg-alt);
    --earth-mid:      var(--bg-base);
    --earth-card:     var(--bg-alt);
    --earth-surface:  var(--bg-alt);
    --earth-umber:    var(--text-muted);
    --earth-sienna:   var(--text-muted);
    --earth-linen:    var(--text-main);
    --earth-parchment: var(--text-main);

    --magenta:        var(--accent);
    --magenta-glow:   transparent;
    --magenta-soft:   transparent;
    --magenta-mid:    rgba(0,0,0,0.05);
    --magenta-hot:    var(--accent);

    --ember:          var(--text-main);
    --ember-glow:     transparent;
    --moss:           var(--text-main);
    --moss-glow:      transparent;

    --text-bright:    var(--text-main);
    --text-warm:      var(--text-main);
    --text-muted:     var(--text-muted);

    --border:         rgba(0, 0, 0, 0.1);
    --border-warm:    rgba(0, 0, 0, 0.15);
    --border-magenta: var(--accent);"""

pattern_root = r"    /\* Renaissance Earth Palette \*/.*?--border-magenta: rgba\(255, 20, 147, 0\.2\);"
css = re.sub(pattern_root, new_vars, css, flags=re.DOTALL)

# 3. Update radius
css = re.sub(r"--radius:\s*14px;", "--radius:         2px;", css)
css = re.sub(r"--radius-lg:\s*22px;", "--radius-lg:      2px;", css)
css = re.sub(r"--radius-xl:\s*32px;", "--radius-xl:      2px;", css)

# 4. Buttons: brutalist redesign
btn_primary_old = """    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: var(--magenta);
    color: #fff;
    font-weight: 700;
    font-size: 15px;
    padding: 16px 34px;
    border-radius: 100px;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 4px 30px var(--magenta-glow);
    cursor: none;
    position: relative;
    overflow: hidden;
    isolation: isolate;"""
btn_primary_new = """    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: transparent;
    color: #000000;
    font-weight: 700;
    font-size: 15px;
    padding: 16px 34px;
    border: 1px solid #000000;
    border-radius: 2px;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    cursor: none;
    position: relative;
    overflow: hidden;
    isolation: isolate;"""
css = css.replace(btn_primary_old, btn_primary_new)

btn_primary_hover_old = """    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 16px 50px var(--magenta-glow);"""
btn_primary_hover_new = """    transform: none;
    background: #000000;
    color: #FFFFFF;"""
css = css.replace(btn_primary_hover_old, btn_primary_hover_new)

# nav-cta
nav_cta_old = """    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--magenta);
    color: #fff;
    font-weight: 700;
    font-size: 13px;
    padding: 10px 22px;
    border-radius: 100px;
    letter-spacing: 0.3px;
    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 0 0 0 var(--magenta-glow);
    cursor: none;"""
nav_cta_new = """    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    color: #000000;
    font-weight: 700;
    font-size: 13px;
    padding: 10px 22px;
    border: 1px solid #000000;
    border-radius: 2px;
    letter-spacing: 0.3px;
    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    cursor: none;"""
css = css.replace(nav_cta_old, nav_cta_new)

nav_cta_hover_old = """    background: var(--magenta-hot);
    transform: translateY(-2px);
    box-shadow: 0 8px 32px var(--magenta-glow);"""
nav_cta_hover_new = """    background: #000000;
    color: #FFFFFF;
    transform: none;"""
css = css.replace(nav_cta_hover_old, nav_cta_hover_new)

# btn-ghost
btn_ghost_old = """    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--text-warm);
    font-size: 14px;
    font-weight: 500;
    padding: 16px 28px;
    border-radius: 100px;
    border: 1px solid var(--border-warm);
    transition: all 0.35s ease;
    cursor: none;"""
btn_ghost_new = """    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #000000;
    font-size: 14px;
    font-weight: 500;
    padding: 16px 28px;
    border-radius: 2px;
    border: 1px solid #000000;
    transition: all 0.35s ease;
    cursor: none;"""
css = css.replace(btn_ghost_old, btn_ghost_new)

btn_ghost_hover_old = """    color: var(--text-bright);
    border-color: rgba(255, 20, 147, 0.3);
    background: var(--magenta-soft);"""
btn_ghost_hover_new = """    color: #FFFFFF;
    border-color: #000000;
    background: #000000;"""
css = css.replace(btn_ghost_hover_old, btn_ghost_hover_new)

# Clean up before content on btn-primary
css = re.sub(r"\.btn-primary::before \{.*?\n\}", "", css, flags=re.DOTALL)
css = css.replace(".btn-primary:hover::before { opacity: 1; }\n", "")

# 5. Side Nav update
css = css.replace(".side-nav-item.active {\n    color: var(--magenta);\n}", ".side-nav-item.active {\n    color: #000000;\n}")

nav_line_active_old = """    width: 32px;
    background: var(--magenta);
    box-shadow: 0 0 8px var(--magenta-glow);"""
nav_line_active_new = """    width: 32px;
    background: #000000;
    box-shadow: none;"""
css = css.replace(nav_line_active_old, nav_line_active_new)

css = css.replace("background: currentColor;", "background: rgba(0,0,0,0.2);")
# we must fix where currentColor was in other places if they changed?
# side_nav_item is color: var(--text-muted). CurrentColor would be that.
# Let's just explicitly fix the side nav line:

css = css.replace(".side-nav-item .nav-line {\n    width: 18px;\n    height: 1px;\n    background: rgba(0,0,0,0.2);", ".side-nav-item .nav-line {\n    width: 18px;\n    height: 1px;\n    background: rgba(0,0,0,0.2);")

# 6. Text Overlays - Hero
brand_exclaim_old = """    color: var(--magenta);
    font-style: italic;
    text-shadow: 0 0 40px var(--magenta-glow);
    animation: exclamPulse 3s ease-in-out infinite;"""
brand_exclaim_new = """    color: #FFFFFF;
    font-style: italic;
    text-shadow: 0 2px 10px rgba(0,0,0,0.5);"""
css = css.replace(brand_exclaim_old, brand_exclaim_new)

brand_pie_old = """    color: var(--text-bright);
    position: relative;
    -webkit-text-stroke: 0.5px rgba(240, 232, 213, 0.3);"""
brand_pie_new = """    color: #FFFFFF;
    position: relative;
    text-shadow: 0 2px 10px rgba(0,0,0,0.5);
    -webkit-text-stroke: none;"""
css = css.replace(brand_pie_old, brand_pie_new)

css = css.replace(".serif-italic {\n    font-family: 'Playfair Display', serif;\n    font-style: italic;\n    font-weight: 600;\n    font-size: var(--fs-hero);\n    color: var(--earth-linen);", ".serif-italic {\n    font-family: 'Playfair Display', serif;\n    font-style: italic;\n    font-weight: 600;\n    font-size: var(--fs-hero);\n    color: #FFFFFF;\n    text-shadow: 0 2px 10px rgba(0,0,0,0.5);")

hero_desc_old = """    color: var(--text-warm);
    line-height: 1.8;
    max-width: 460px;
    margin-bottom: 40px;
    opacity: 0;
    transform: translateY(16px);
    text-shadow: 0 1px 8px rgba(12, 10, 8, 0.8);"""
hero_desc_new = """    color: #FFFFFF;
    line-height: 1.8;
    max-width: 460px;
    margin-bottom: 40px;
    opacity: 0;
    transform: translateY(16px);
    text-shadow: 0 2px 10px rgba(0,0,0,0.8);"""
css = css.replace(hero_desc_old, hero_desc_new)

css = css.replace(".hero-sub {\n    font-size: calc(var(--fs-hero) * 0.55);\n    color: var(--text-warm);", ".hero-sub {\n    font-size: calc(var(--fs-hero) * 0.55);\n    color: #FFFFFF;")

# Nav line active we must make sure it was not `background: currentColor`
# we did: css.replace("background: currentColor;", "background: rgba(0,0,0,0.2);")

# Also, the buttons are on the video overlay too. If they are transparent with black border, they might be impossible to see.
# Wait, "For the hero CTA, the transparent background with black border on hover invert to black background white text". Let's use `mix-blend-mode: difference` for the hero buttons so they are visible over the video, or just let them be black as requested. The instruction: "Text Overlays: Ensure the "Pie!" text sitting on top of the Hero video uses color: #FFFFFF... "
# It specifically says "Buttons: Completely redesign any "Get Free" or call-to-action buttons... transparent backgrounds with a thin 1px solid #000 border... black text". So I will just do that! They'll have a black button on the video.

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(css)

print("Update complete")
