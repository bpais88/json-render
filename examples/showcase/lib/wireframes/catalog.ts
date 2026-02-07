import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { z } from "zod";

/**
 * Wireframe / UI Mockup Catalog
 *
 * Low-fidelity wireframe components for generating UI mockups.
 * The AI generates a Wireframe with Screens containing layout and UI elements.
 */
export const wireframeCatalog = defineCatalog(schema, {
  components: {
    Wireframe: {
      props: z.object({
        title: z.string(),
        device: z.enum(["desktop", "mobile", "tablet"]).nullable(),
      }),
      slots: ["default"],
      description:
        "Root container for a wireframe project. title is the project/app name. device sets the viewport frame. Children are Screen elements.",
    },

    Screen: {
      props: z.object({
        name: z.string(),
        description: z.string().nullable(),
      }),
      slots: ["default"],
      description:
        "A single screen/page in the wireframe. name is the screen title (e.g. 'Login', 'Dashboard'). description explains what this screen does. Children are layout and UI elements.",
    },

    Row: {
      props: z.object({
        gap: z.enum(["sm", "md", "lg"]).nullable(),
        align: z.enum(["start", "center", "end", "stretch"]).nullable(),
      }),
      slots: ["default"],
      description:
        "Horizontal flex row. Use to place elements side by side. Children are any UI elements.",
    },

    Column: {
      props: z.object({
        width: z
          .enum(["auto", "1/4", "1/3", "1/2", "2/3", "3/4", "full"])
          .nullable(),
        gap: z.enum(["sm", "md", "lg"]).nullable(),
      }),
      slots: ["default"],
      description:
        "Vertical flex column. Use inside Row for multi-column layouts, or standalone for vertical stacking. width controls how much horizontal space it takes.",
    },

    NavBar: {
      props: z.object({
        brand: z.string(),
        items: z.array(z.string()),
      }),
      description:
        "Top navigation bar. brand is the logo/app name. items is an array of nav link labels like ['Home', 'About', 'Settings'].",
    },

    Sidebar: {
      props: z.object({
        items: z.array(z.string()),
        active: z.string().nullable(),
      }),
      description:
        "Vertical sidebar navigation. items is an array of menu labels. active highlights one item as the current page.",
    },

    Heading: {
      props: z.object({
        text: z.string(),
        level: z.enum(["h1", "h2", "h3"]).nullable(),
      }),
      description:
        "Heading text. level controls size: h1 is page title, h2 is section, h3 is subsection.",
    },

    Paragraph: {
      props: z.object({
        text: z.string(),
        lines: z.enum(["1", "2", "3", "4"]).nullable(),
      }),
      description:
        "Block of text. Use text for actual content, or set lines to show placeholder 'lorem ipsum' lines (1-4 lines of squiggly placeholder).",
    },

    Button: {
      props: z.object({
        label: z.string(),
        variant: z
          .enum(["primary", "secondary", "outline", "danger", "ghost"])
          .nullable(),
        size: z.enum(["sm", "md", "lg"]).nullable(),
        icon: z.string().nullable(),
      }),
      description:
        "Clickable button. variant controls style: primary (filled), secondary (gray), outline (bordered), danger (red), ghost (text only). icon is optional icon name before label.",
    },

    TextInput: {
      props: z.object({
        label: z.string().nullable(),
        placeholder: z.string(),
        type: z
          .enum(["text", "email", "password", "search", "number", "url"])
          .nullable(),
        required: z.boolean().nullable(),
      }),
      description:
        "Single-line text input field. label appears above the input. placeholder shows hint text inside.",
    },

    TextArea: {
      props: z.object({
        label: z.string().nullable(),
        placeholder: z.string(),
        rows: z.enum(["2", "3", "4", "6"]).nullable(),
      }),
      description: "Multi-line text area. rows controls the height.",
    },

    Select: {
      props: z.object({
        label: z.string().nullable(),
        placeholder: z.string(),
        options: z.array(z.string()),
      }),
      description:
        "Dropdown select. options is an array of choice labels. placeholder shows before selection.",
    },

    Checkbox: {
      props: z.object({
        label: z.string(),
        checked: z.boolean().nullable(),
      }),
      description: "Checkbox with label. checked controls initial state.",
    },

    RadioGroup: {
      props: z.object({
        label: z.string().nullable(),
        options: z.array(z.string()),
        selected: z.string().nullable(),
      }),
      description:
        "Group of radio buttons. options is an array of choice labels. selected highlights one.",
    },

    Toggle: {
      props: z.object({
        label: z.string(),
        enabled: z.boolean().nullable(),
      }),
      description: "On/off toggle switch with label.",
    },

    Card: {
      props: z.object({
        title: z.string().nullable(),
        subtitle: z.string().nullable(),
      }),
      slots: ["default"],
      description:
        "Bordered card container. title and subtitle are optional header text. Children are any elements inside the card.",
    },

    Table: {
      props: z.object({
        columns: z.array(z.string()),
        rows: z.enum(["3", "5", "8", "10"]).nullable(),
        striped: z.boolean().nullable(),
      }),
      description:
        "Data table. columns is an array of column header names. rows is how many placeholder data rows to show.",
    },

    List: {
      props: z.object({
        items: z.array(z.string()),
        ordered: z.boolean().nullable(),
        icon: z.string().nullable(),
      }),
      description:
        "Bulleted or numbered list. items is an array of text entries. ordered shows numbers instead of bullets.",
    },

    ImagePlaceholder: {
      props: z.object({
        label: z.string().nullable(),
        aspect: z.enum(["square", "video", "wide", "tall"]).nullable(),
        size: z.enum(["sm", "md", "lg", "full"]).nullable(),
      }),
      description:
        "Image placeholder box with crossed lines. label describes what image goes here. aspect controls the shape. size controls width.",
    },

    Avatar: {
      props: z.object({
        name: z.string(),
        size: z.enum(["sm", "md", "lg"]).nullable(),
      }),
      description:
        "Circular avatar placeholder showing initials. name is the person's name (initials are auto-derived).",
    },

    Badge: {
      props: z.object({
        text: z.string(),
        variant: z
          .enum(["default", "success", "warning", "error", "info"])
          .nullable(),
      }),
      description: "Small status badge/tag. variant controls the color.",
    },

    Divider: {
      props: z.object({
        label: z.string().nullable(),
      }),
      description:
        "Horizontal divider line. Optional label text centered on the line.",
    },

    Breadcrumb: {
      props: z.object({
        items: z.array(z.string()),
      }),
      description:
        "Breadcrumb navigation trail. items is an array of page names, last one is current.",
    },

    Tabs: {
      props: z.object({
        items: z.array(z.string()),
        active: z.string().nullable(),
      }),
      description:
        "Tab navigation bar. items is an array of tab labels. active highlights the selected tab.",
    },

    Modal: {
      props: z.object({
        title: z.string(),
        width: z.enum(["sm", "md", "lg"]).nullable(),
      }),
      slots: ["default"],
      description:
        "Modal/dialog overlay. title is the modal heading. Children are the modal body content. Rendered as a card with a dimmed backdrop hint.",
    },

    Toast: {
      props: z.object({
        message: z.string(),
        variant: z.enum(["success", "error", "warning", "info"]).nullable(),
        position: z
          .enum(["top-right", "bottom-right", "top-center"])
          .nullable(),
      }),
      description:
        "Toast notification. Rendered as a small floating card. Use to show feedback messages.",
    },

    ProgressBar: {
      props: z.object({
        label: z.string().nullable(),
        percent: z.number(),
      }),
      description:
        "Progress bar showing completion percentage (0-100). label describes what's progressing.",
    },

    Skeleton: {
      props: z.object({
        lines: z.enum(["1", "2", "3", "4"]).nullable(),
        type: z.enum(["text", "card", "avatar"]).nullable(),
      }),
      description:
        "Loading skeleton placeholder. type controls the shape: text (horizontal bars), card (rectangular block), avatar (circle).",
    },

    Annotation: {
      props: z.object({
        text: z.string(),
        color: z.enum(["red", "blue", "green", "yellow"]).nullable(),
      }),
      description:
        "Designer annotation/sticky note. Use for wireframe comments like 'TODO: add validation', 'Links to settings page', etc. Rendered as a tilted sticky note.",
    },
  },

  actions: {},
});

const customRules = [
  "The root element MUST be a Wireframe",
  "Generate 1-4 Screens to show the complete user flow",
  "Each Screen MUST have a descriptive name like 'Login', 'Dashboard', 'Settings'",
  "Use Row and Column for layouts — Row for horizontal, Column inside Row for multi-column",
  "Use NavBar at the top of screens that need navigation",
  "Use Sidebar + Column layout for admin/dashboard screens: Row > Sidebar + Column",
  "Use Card to group related content sections",
  "Use TextInput, Select, Checkbox, RadioGroup, TextArea for form elements",
  "Use Table for data-heavy screens (user lists, orders, etc.)",
  "Use ImagePlaceholder for hero images, product photos, avatars",
  "Use Annotation to add designer notes about interactions or edge cases",
  "Use Breadcrumb and Tabs for multi-level navigation patterns",
  "Keep text realistic but concise — use actual labels, not 'Lorem ipsum'",
  "Use Modal only when the prompt implies an overlay (confirm dialog, edit form)",
  "Use Toast to show notification patterns",
  "Use Divider to separate content sections within a screen",
  "Mix element types for realistic UIs — a form screen needs headings, inputs, AND buttons",
];

export function getWireframePrompt(): string {
  return wireframeCatalog.prompt({ customRules });
}
