"use client"

import { useEffect, useState } from "react"
import { HONEYPOT_FIELD, TIMESTAMP_FIELD } from "@/lib/security/honeypot"

export function HoneypotFields() {
  const [ts, setTs] = useState("")
  useEffect(() => setTs(String(Date.now())), [])

  return (
    <>
      <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", top: "auto", width: "1px", height: "1px", overflow: "hidden" }}>
        <label htmlFor={HONEYPOT_FIELD}>Website (leave blank)</label>
        <input
          type="text"
          id={HONEYPOT_FIELD}
          name={HONEYPOT_FIELD}
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>
      <input type="hidden" name={TIMESTAMP_FIELD} value={ts} readOnly />
    </>
  )
}
