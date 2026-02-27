# Style Guide: Casper Holden Portfolio

This document defines the core design system, layout logic, and interaction principles for the Casper Holden personal portfolio.

---

## 1. Design Tokens

### **Color Palette**
| Token | Hex/Value | Usage |
| :--- | :--- | :--- |
| **Page Background** | `#FFFFFF` | Primary site background |
| **Default Text** | `#212121` | All typography and icons |
| **Project Stroke** | `#D0D0D0` | 1px horizontal dividers between projects |
| **Placeholder BG** | `#F1F1F1` | Image wrapper background |
| **Grid Stroke** | `rgba(255, 0, 0, 0.5)` | 1px red gutter guides (toggleable) |

### **Typography**
* **Font Family:** `Helvetica Neue, Regular`
* **Letter Spacing (Tracking):** `4%` default (body, metadata, links). `2%` for headlines (e.g. “Casper Holden”).
* **Line Height (Leading):** `120% (1.2x)`

| Style | Font Size | Context |
| :--- | :--- | :--- |
| **Headline** | `32px` | Center-page name |
| **Default/Body** | `15px` | Bio, metadata, contact links |
| **UI/Panel** | `12px` | Toggle panel controls |

### **Spacings**
| Token | Value | Usage |
| :--- | :--- | :--- |
| **#small-gap** | `4px` | Vertical gap between stroke and content |
| **#medium-gap** | `8px` | Vertical stacking gap (Tablet/Mobile) |
| **#column-gutter-gap** | `Dynamic` | Equal to current grid gutter (12/16/20px) |
| **Top Margin** | `20px` | Sticky distance for header elements |

---

## 2. Grid & Responsiveness

The grid is fluid with no max-width. Margins and gutters adjust based on breakpoints.

| Breakpoint | Columns | Margin | Gutter |
| :--- | :--- | :--- | :--- |
| **Desktop** (>1024px) | 12 | 20px | 20px |
| **Tablet** (>600px) | 8 | 16px | 16px |
| **Mobile** (<600px) | 6 | 12px | 12px |

---

## 3. Layout Logic

### **The Header (Sticky)**
* **Bio:** Spans Columns 1–4.
* **Contact Links:** Spans Columns 10–12 (Desktop).
    * **Logic:** Brackets `()` are static. Text inside is underlined and linked. 12px gap between link groups.

### **Project Rows (Desktop 12-Col)**
1. **Year:** Column 1
2. **Image Wrapper:** Columns 2–5 (Variable width)
3. **Title:** Column 6 (Fixed or Shifting based on Version)
4. **Description:** Columns 7–9
5. **Disciplines:** Columns 10–12

---

## 4. Interaction Principles

### **Scrolling & Positioning**
* **Starting State:** The project list begins at `80%` of the viewport height.
* **Centered Headline:** "Casper Holden" remains dead-center at `50%` viewport height.

### **Grow Effect (Progressive Scaling)**
* **Start:** Triggered when the project row enters the bottom of the screen.
* **Expansion:** Image wrapper scales from **1-column width** to **4-column width**.
* **Peak:** Full width is achieved at the vertical center of the screen (`50%`).
* **Persistence:** Scaling remains at `100%` (4 columns) once the row is above the center.

### **Toggle Versions (Key 'P')**
* **Version 1 (Fixed):** Metadata columns remain locked to their grid positions while the image grows.
* **Version 2 (Shifting):** The project Title is "pushed" by the growing image wrapper, maintaining a `#column-gutter-gap`.

---

## 5. Keyboard Shortcuts
* **`G`**: Toggle Grid visibility.
* **`P`**: Toggle UI Panel visibility.
