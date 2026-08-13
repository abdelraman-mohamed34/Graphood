import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

export const SYSTEM_README_MAX_LENGTH = 30_000;
export const SYSTEM_DESCRIPTION_MAX_LENGTH = 250;

const unsafeMarkdownPattern = /(?:<\s*script\b|\bon\w+\s*=|(?:href|src)\s*=\s*["']?\s*(?:javascript|vbscript|data):|\]\(\s*(?:javascript|vbscript|data):)/i;

export function hasUnsafeMarkdown(markdown: string): boolean {
    return unsafeMarkdownPattern.test(markdown);
}

export function sanitizeMarkdownSource(markdown: string): string {
    return sanitizeHtml(markdown, {
        allowedTags: [],
        allowedAttributes: {},
        disallowedTagsMode: "discard",
    });
}

export function renderSafeMarkdown(markdown: string): string {
    const rendered = marked.parse(markdown, { async: false, gfm: true, breaks: false });

    return sanitizeHtml(rendered, {
        allowedTags: [
            "h1", "h2", "h3", "h4", "h5", "h6", "p", "br", "hr",
            "strong", "em", "del", "blockquote", "ul", "ol", "li",
            "pre", "code", "table", "thead", "tbody", "tr", "th", "td", "a", "img",
        ],
        allowedAttributes: {
            a: ["href", "title", "target", "rel"],
            img: ["src", "alt", "width", "height", "class", "style"],
            code: ["class"],
            th: ["align"],
            td: ["align"],
        },
        allowedSchemes: ["http", "https", "mailto"],
        allowedSchemesAppliedToAttributes: ["href", "src"],
        allowProtocolRelative: false,
        allowedStyles: {
            img: {
                display: [/^(?:block|inline|inline-block)$/],
                width: [/^(?:auto|\d+(?:\.\d+)?(?:px|%|rem|em|vw))$/],
                height: [/^(?:auto|\d+(?:\.\d+)?(?:px|%|rem|em|vh))$/],
                "max-width": [/^(?:none|\d+(?:\.\d+)?(?:px|%|rem|em|vw))$/],
                "max-height": [/^(?:none|\d+(?:\.\d+)?(?:px|%|rem|em|vh))$/],
                "object-fit": [/^(?:contain|cover|fill|none|scale-down)$/],
                margin: [/^(?:auto|0|\d+(?:\.\d+)?(?:px|rem|em|%))(?:\s+(?:auto|0|\d+(?:\.\d+)?(?:px|rem|em|%))){0,3}$/],
                "border-radius": [/^(?:0|\d+(?:\.\d+)?(?:px|rem|em|%))$/],
            },
        },
        transformTags: {
            a: (_tagName, attribs) => ({
                tagName: "a",
                attribs: {
                    ...attribs,
                    target: "_blank",
                    rel: "noopener noreferrer",
                },
            }),
        },
        disallowedTagsMode: "discard",
    });
}
