"use client"

import { useState } from "react"

type Props = {
  mode: "personal" | "shared"
  checkboxMode: boolean
  isPrivate: boolean
  backgroundImage?: string | null
  onChange: (next: { checkboxMode?: boolean; isPrivate?: boolean; backgroundImage?: string | null }) => Promise<void>
}

export default function NotesSettings({ mode, checkboxMode, isPrivate, backgroundImage, onChange }: Props) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/15"
      >
        ⚙️ Settings
      </button>

      {open ? (
        <div className="absolute right-0 top-12 z-20 w-72 rounded-2xl border border-white/10 bg-zinc-950 p-4 shadow-2xl">
          <div className="flex items-center justify-between">
            <strong>Notes settings</strong>
            <button onClick={() => setOpen(false)} className="text-white/50">×</button>
          </div>

          <button
            onClick={() => onChange({ checkboxMode: !checkboxMode })}
            className="mt-4 flex w-full items-center justify-between rounded-xl bg-white/5 p-3 text-left"
          >
            <span>
              <span className="block font-medium">☑️ Checkbox mode</span>
              <span className="text-xs text-white/45">Checked items get strikethrough.</span>
            </span>
            <span>{checkboxMode ? "ON" : "OFF"}</span>
          </button>

          {mode === "personal" ? (
            <button
              onClick={() => onChange({ isPrivate: !isPrivate })}
              className="mt-2 flex w-full items-center justify-between rounded-xl bg-white/5 p-3 text-left"
            >
              <span>
                <span className="block font-medium">🔒 Private</span>
                <span className="text-xs text-white/45">Lock it for the other user.</span>
              </span>
              <span>{isPrivate ? "ON" : "OFF"}</span>
            </button>
          ) : null}

          <label className="mt-2 block rounded-xl bg-white/5 p-3 text-sm"><span className="block font-medium">🖼️ Background image</span><input type="file" accept="image/*" className="mt-2 w-full text-xs" onChange={e=>{const f=e.target.files?.[0];if(!f)return;if(f.size>5*1024*1024){alert("Choose an image under 5 MB.");return}const r=new FileReader();r.onload=()=>void onChange({backgroundImage:String(r.result||"")});r.readAsDataURL(f)}}/></label>{backgroundImage ? <button onClick={()=>onChange({backgroundImage:null})} className="mt-2 w-full rounded-xl bg-white/5 p-3 text-sm">Remove background</button> : null}
          <p className="mt-3 text-xs leading-5 text-white/35">
            Rich text tools are available from Aa while editing.
          </p>
        </div>
      ) : null}
    </div>
  )
}
