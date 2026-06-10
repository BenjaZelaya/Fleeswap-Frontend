export default function ChatSkeleton() {
  const rows = [
    {
      own: false,
      w: '52%'
    }
    ,
    {
      own: true,
      w: '44%'
    },
    {
      own: false,
      w: '60%'
    },
    {
      own: true,
      w: '38%'
    },
    {
      own: false,
      w: '55%'
    },
    {
      own: true,
      w: '42%'
    },
  ]
  return (
    <div className="flex flex-col gap-4 px-4 py-6 animate-pulse">
      {rows.map(({ own, w }, i) => (
        <div key={i} className={`flex items-end gap-2.5 ${own ? 'flex-row-reverse' : 'flex-row'}`}>
          {!own && <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />}
          <div
            className="flex flex-col gap-1"
            style={{ width: w, alignItems: own ? 'flex-end' : 'flex-start' }}
          >
            <div className="h-10 w-full rounded-2xl bg-slate-200" />
            <div className="h-2.5 w-12 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  )
}
