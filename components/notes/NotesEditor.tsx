"use client"

import { useEffect, useRef, useState } from "react"
import type { MouseEvent } from "react"

type Mode = "personal" | "other" | "shared"

type Props = {
  mode: Mode
  initialContent: string
  initialCheckboxMode: boolean
  canEdit: boolean
  locked: boolean
  backgroundImage?: string | null
  onSaved?: (content: string) => void
}

const highlightColors = ["#ffffff00", "#fecdd3", "#fde68a", "#d9f99d", "#a5f3fc", "#ddd6fe", "#fed7aa"]
const textColors = ["#111827", "#2563eb", "#dc2626", "#f59e0b", "#16a34a", "#06b6d4", "#9333ea"]

function prepareCheckboxMarkup(html: string) {
  if (!html.trim()) return '<div data-note-item="true" data-checked="false"><br></div>'
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, "text/html")
  Array.from(doc.body.children).forEach((node) => {
    if (!(node instanceof HTMLElement)) return
    node.setAttribute("data-note-item", "true")
    if (!node.hasAttribute("data-checked")) node.setAttribute("data-checked", "false")
  })
  return doc.body.innerHTML
}

function removeCheckboxMarkup(html: string) {
  return html
    .replace(/\sdata-note-item="true"/g, "")
    .replace(/\sdata-checked="(?:true|false)"/g, "")
}

export default function NotesEditor({
  mode,
  initialContent,
  initialCheckboxMode,
  canEdit,
  locked,
  backgroundImage,
  onSaved,
}: Props) {
  const editorRef = useRef<HTMLDivElement>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [checkboxMode, setCheckboxMode] = useState(initialCheckboxMode)
  const [showFormat, setShowFormat] = useState(false)
  const [fontIndex, setFontIndex] = useState(2)
  const [saved, setSaved] = useState(true)
  const [emojiOpen, setEmojiOpen] = useState(false)

  const fontSizes = [12, 14, 16, 18, 22, 28, 34]

  useEffect(() => {
    if (!editorRef.current) return
    editorRef.current.innerHTML = checkboxMode
      ? prepareCheckboxMarkup(initialContent)
      : initialContent || "<div><br></div>"
  }, [initialContent])

  useEffect(() => {
    if (!editorRef.current || checkboxMode === initialCheckboxMode) return
    const current = editorRef.current.innerHTML
    editorRef.current.innerHTML = initialCheckboxMode
      ? prepareCheckboxMarkup(current)
      : removeCheckboxMarkup(current)
    setCheckboxMode(initialCheckboxMode)
  }, [initialCheckboxMode, checkboxMode])

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [])

  function focusEditor() {
    editorRef.current?.focus()
  }

  function command(name: string, value?: string) {
    focusEditor()
    document.execCommand(name, false, value)
    scheduleSave()
  }

  function scheduleSave(extra?: { checkboxMode?: boolean }) {
    if (!canEdit) return
    setSaved(false)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => void save(extra), 700)
  }

  async function save(extra?: { checkboxMode?: boolean }) {
    if (!canEdit || !editorRef.current) return
    const nextCheckboxMode = extra?.checkboxMode ?? checkboxMode
    const response = await fetch("/api/notes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: mode === "shared" ? "shared" : "personal",
        content: editorRef.current.innerHTML,
        checkboxMode: nextCheckboxMode,
      }),
    })
    if (response.ok) {
      setSaved(true)
      onSaved?.(editorRef.current.innerHTML)
    } else {
      setSaved(false)
    }
  }

  function handleInput() {
    scheduleSave()
  }

  function toggleCheckboxMode() {
    const next = !checkboxMode
    const current = editorRef.current?.innerHTML ?? ""
    const converted = next ? prepareCheckboxMarkup(current) : removeCheckboxMarkup(current)
    if (editorRef.current) editorRef.current.innerHTML = converted
    setCheckboxMode(next)
    scheduleSave({ checkboxMode: next })
  }

  function toggleCheck(event: MouseEvent<HTMLDivElement>) {
    if (!checkboxMode || !canEdit) return
    const target = event.target as HTMLElement
    const item = target.closest("[data-note-item]") as HTMLElement | null
    if (!item || item === editorRef.current) return

    const rect = item.getBoundingClientRect()
    if (event.clientX - rect.left <= 38) {
      item.dataset.checked = item.dataset.checked === "true" ? "false" : "true"
      scheduleSave()
    }
  }

  function changeFontSize(delta: number) {
    const nextIndex = Math.min(fontSizes.length - 1, Math.max(0, fontIndex + delta))
    setFontIndex(nextIndex)
    command("fontSize", String(nextIndex + 1))
  }

  function insertEmoji(emoji: string) {
    focusEditor()
    document.execCommand("insertText", false, emoji)
    setEmojiOpen(false)
    scheduleSave()
  }

  function setHighlight(color: string) {
    command("hiliteColor", color)
  }

  function setTextColor(color: string) {
    command("foreColor", color)
  }

  async function resetNote() {
    if (!window.confirm("Reset this entire notebook? This cannot be undone.")) return
    if (editorRef.current) {
      editorRef.current.innerHTML = checkboxMode
        ? prepareCheckboxMarkup("")
        : "<div><br></div>"
    }
    await save()
  }

  if (locked) {
    return (
      <div className="mt-6 rounded-[2rem] border border-white/10 bg-black/20 p-10 text-center">
        <div className="text-5xl">🔒</div>
        <p className="mt-4 text-lg font-semibold">This notebook is private.</p>
        <p className="mt-1 text-sm text-white/55">The owner has locked it for now.</p>
      </div>
    )
  }

  return (
    <div className="mt-5 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.07] shadow-2xl backdrop-blur-xl">
      <div
        ref={editorRef}
        contentEditable={canEdit}
        suppressContentEditableWarning
        onInput={handleInput}
        onClick={toggleCheck}
        style={backgroundImage ? { backgroundImage: `linear-gradient(rgba(0,0,0,.18),rgba(0,0,0,.18)),url(${backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
        className={`checkbox-notes min-h-[55vh] px-5 py-6 text-[16px] leading-7 outline-none ${canEdit ? "cursor-text" : "cursor-default"}`}
        data-placeholder="Start writing…"
      />

      {canEdit && mode !== "other" ? (
        <>
          <div className="border-t border-white/10 bg-black/20 px-3 py-2">
            <div className="flex items-center gap-1 overflow-x-auto">
              <button onClick={() => setShowFormat((value) => !value)} className="rounded-xl px-3 py-2 text-lg font-bold hover:bg-white/10" title="Formatting">Aa</button>
              <button onClick={toggleCheckboxMode} className={`rounded-xl px-3 py-2 hover:bg-white/10 ${checkboxMode ? "bg-white/15" : ""}`} title="Checkbox mode">☑️</button>
              <button onClick={() => command("bold")} className="rounded-xl px-3 py-2 font-bold hover:bg-white/10" title="Bold">B</button>
              <button onClick={() => command("underline")} className="rounded-xl px-3 py-2 underline hover:bg-white/10" title="Underline">U</button>
              <button onClick={() => setEmojiOpen((value) => !value)} className="rounded-xl px-3 py-2 hover:bg-white/10" title="Emoji">🙂</button>
              <button onClick={() => command("undo")} className="rounded-xl px-3 py-2 hover:bg-white/10" title="Undo">↶</button>
              <button onClick={() => command("redo")} className="rounded-xl px-3 py-2 hover:bg-white/10" title="Redo">↷</button>
            </div>
          </div>

          {emojiOpen ? (
            <div className="border-t border-white/10 bg-zinc-950 p-3">
              <div className="grid grid-cols-8 gap-1">
                {["❤️","🥺","😂","😍","😘","😭","😴","✨","🫶","💕","😎","🤍","🫂","🔥","🌙","☀️"].map((emoji) => (
                  <button key={emoji} onClick={() => insertEmoji(emoji)} className="rounded-xl p-2 text-xl hover:bg-white/10">{emoji}</button>
                ))}
              </div>
            </div>
          ) : null}

          {showFormat ? (
            <div className="border-t border-white/10 bg-white p-4 text-slate-900">
              <div className="flex items-center justify-between">
                <button onClick={() => setShowFormat(false)} className="text-2xl">×</button>
                <strong className="text-lg">Font & formatting</strong>
                <button onClick={() => setShowFormat(false)} className="text-2xl">✓</button>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-100 p-2">
                <div className="flex gap-1">
                  <button onClick={() => command("bold")} className="rounded-lg px-3 py-2 font-bold hover:bg-white">B</button>
                  <button onClick={() => command("italic")} className="rounded-lg px-3 py-2 italic hover:bg-white">I</button>
                  <button onClick={() => command("underline")} className="rounded-lg px-3 py-2 underline hover:bg-white">U</button>
                  <button onClick={() => command("strikeThrough")} className="rounded-lg px-3 py-2 hover:bg-white">S̶</button>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => changeFontSize(-1)} className="rounded-full bg-slate-200 px-3 py-2">−</button>
                  <span className="w-8 text-center">{fontSizes[fontIndex]}</span>
                  <button onClick={() => changeFontSize(1)} className="rounded-full bg-slate-200 px-3 py-2">+</button>
                </div>
              </div>

              <div className="mt-3 rounded-2xl bg-slate-100 p-3">
                <div className="mb-2 text-xs font-semibold text-slate-500">Highlight / background</div>
                <div className="flex flex-wrap gap-2">
                  {highlightColors.map((color) => (
                    <button key={color} onClick={() => setHighlight(color)} style={{ backgroundColor: color }} className="h-9 w-9 rounded-full border-2 border-slate-300 shadow" />
                  ))}
                </div>
              </div>

              <div className="mt-3 rounded-2xl bg-slate-100 p-3">
                <div className="mb-2 text-xs font-semibold text-slate-500">Text color</div>
                <div className="flex flex-wrap gap-2">
                  {textColors.map((color) => (
                    <button key={color} onClick={() => setTextColor(color)} style={{ backgroundColor: color }} className="h-9 w-9 rounded-full border-2 border-white shadow" />
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-between border-t border-white/10 px-4 py-3">
            <span className="text-xs text-white/35">{saved ? "Saved to Satella" : "Saving…"}</span>
            <button onClick={() => void resetNote()} className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/15">Reset notebook</button>
          </div>
        </>
      ) : null}
    </div>
  )
}
