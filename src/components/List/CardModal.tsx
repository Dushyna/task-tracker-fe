import { useState, useRef, type ChangeEvent } from "react";

interface CardModalProps {
  card: { id: string; title: string; description: string };
  onClose: () => void;
}

export default function CardModal({ card, onClose }: CardModalProps) {
  const [description, setDescription] = useState(card.description);
  const [showLabels, setShowLabels] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [checklistTitle, setChecklistTitle] = useState("");
  const [isCreatingChecklist, setIsCreatingChecklist] = useState(false);
  const [activeChecklist, setActiveChecklist] = useState<{title: string, items: {id: number, text: string, completed: boolean}[]} | null>(null);
  const [newItemText, setNewItemText] = useState("");

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startDate, setStartDate] = useState<number | null>(20);
  const [dueDate, setDueDate] = useState<number | null>(31);
  const [tempTime, setTempTime] = useState("11:13");
  const [selectedFullDate, setSelectedFullDate] = useState<{range: string, time: string, reminder: string} | null>(null);
  const [hasStartDate, setHasStartDate] = useState(true);
  const [hasDueDate, setHasDueDate] = useState(true);
  const [reminder, setReminder] = useState("1 day before");

  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [coverColor, setCoverColor] = useState("bg-cyan-500");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [members, setMembers] = useState<string[]>([]);

  const [showAttachmentPicker, setShowAttachmentPicker] = useState(false);
  const [attachments, setAttachments] = useState<{name: string, date: string, type: string}[]>([]);
  const [commentText, setCommentText] = useState("");
  const [linkInput, setLinkInput] = useState("");
  const [linkName, setLinkName] = useState("");
  const [currentUser] = useState("You"); 
  const [activities, setActivities] = useState<{id: number, user: string, action: string, time: string}[]>([]);

  const coverFileRef = useRef<HTMLInputElement>(null);
  const avatarFileRef = useRef<HTMLInputElement>(null);
  const memberFileRef = useRef<HTMLInputElement>(null);
  const attachFileRef = useRef<HTMLInputElement>(null);

  const coverOptions = [
    { color: 'bg-cyan-500' }, { color: 'bg-blue-600' }, { color: 'bg-indigo-600' },
    { color: 'bg-purple-600' }, { color: 'bg-fuchsia-500' }, { color: 'bg-rose-500' },
    { color: 'bg-orange-500' }, { color: 'bg-amber-400' }, { color: 'bg-emerald-500' },
    { color: 'bg-slate-800' }, { color: 'bg-pink-400' }, { color: 'bg-teal-500' }
  ];

  const availableLabels = [
    { id: "fe", color: "bg-cyan-500", text: "FE" },
    { id: "be", color: "bg-slate-900", text: "BE" },
    { id: "qa", color: "bg-orange-500", text: "QA" },
    { id: "design", color: "bg-blue-600", text: "DESIGN" },
  ];

  const handleDateClick = (day: number) => {
    if (!startDate || (startDate && dueDate)) {
      setStartDate(day); setDueDate(null);
    } else {
      if (day < startDate) { setDueDate(startDate); setStartDate(day); } 
      else { setDueDate(day); }
    }
  };

  const toggleLabel = (id: string) => {
    setSelectedLabels(prev => prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]);
  };

  const toggleItem = (id: number) => {
    if (activeChecklist) {
      setActiveChecklist({ ...activeChecklist, items: activeChecklist.items.map(item => item.id === id ? { ...item, completed: !item.completed } : item) });
    }
  };

  const addItem = () => {
    if (newItemText.trim() && activeChecklist) {
      setActiveChecklist({ ...activeChecklist, items: [...activeChecklist.items, { id: Date.now(), text: newItemText, completed: false }] });
      setNewItemText("");
    }
  };

  const createChecklist = () => {
    if (checklistTitle.trim()) {
      setActiveChecklist({ title: checklistTitle, items: [] });
      setIsCreatingChecklist(false);
      setChecklistTitle("");
    }
  };

  const handleAttachFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachments(prev => [...prev, { name: file.name, date: "Added today", type: file.name.split('.').pop()?.toUpperCase() || "FILE" }]);
      setActivities(prev => [{ id: Date.now(), user: currentUser, action: `attached ${file.name}`, time: "just now" }, ...prev]);
      setShowAttachmentPicker(false);
    }
  };

  const handleAttachLink = () => {
    if (linkInput.trim()) {
      setAttachments(prev => [...prev, { name: linkName.trim() || linkInput, date: "Added today", type: "LINK" }]);
      setActivities(prev => [{ id: Date.now(), user: currentUser, action: `attached a link`, time: "just now" }, ...prev]);
      setLinkInput(""); setLinkName(""); setShowAttachmentPicker(false);
    }
  };

  const addComment = () => {
    if (commentText.trim()) {
      setActivities(prev => [{ id: Date.now(), user: currentUser, action: `commented: "${commentText}"`, time: "just now" }, ...prev]);
      setCommentText("");
    }
  };

  const progress = activeChecklist?.items.length ? Math.round((activeChecklist.items.filter(i => i.completed).length / activeChecklist.items.length) * 100) : 0;

  const actionButtons = [
    { id: 'members', label: 'Members', icon: '👤', action: () => memberFileRef.current?.click() },
    { id: 'labels', label: 'Labels', icon: '🏷', action: () => setShowLabels(!showLabels) },
    { id: 'checklist', label: 'Checklist', icon: '✅', action: () => setIsCreatingChecklist(!isCreatingChecklist) },
    { id: 'dates', label: 'Dates', icon: '📅', action: () => setShowDatePicker(!showDatePicker) },
    { id: 'attachment', label: 'Attachment', icon: '📎', action: () => setShowAttachmentPicker(!showAttachmentPicker) },
    { id: 'cover', label: 'Cover', icon: '🖼', action: () => setShowCoverPicker(!showCoverPicker) },
  ];

  return (
    <div className="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-md z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-[#f1f2f4] rounded-[24px]sm:rounded-[40px] shadow-2xl w-full max-w-5xl my-2 sm:my-8 relative flex flex-col h-auto min-h-fit" onClick={(e) => e.stopPropagation()}>
        
        <input type="file" ref={coverFileRef} className="hidden" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { setCoverImage(URL.createObjectURL(file)); setShowCoverPicker(false); } }} />
        <input type="file" ref={avatarFileRef} className="hidden" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) setUserAvatar(URL.createObjectURL(file)); }} />
        <input type="file" ref={memberFileRef} className="hidden" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) setMembers(prev => [...prev, URL.createObjectURL(file)]); }} />
        <input type="file" ref={attachFileRef} className="hidden" onChange={handleAttachFile} />

        <div className={`h-48 w-full shrink-0 relative transition-all duration-500 ${!coverImage ? coverColor : ''} rounded-t-[40px] shadow-inner`}
          style={{ backgroundImage: coverImage ? `url(${coverImage})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <button onClick={onClose} className="absolute top-6 right-6 bg-black/20 hover:bg-black/40 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold z-10 transition-all">✕</button>
          <div className="absolute -bottom-8 left-4 sm:-bottom-10 sm:left-10 group">
            <div className="w-18 h-18 sm:w-24 sm:h-24 rounded-full border-[4px] sm:border-[6px] border-[#f1f2f4] shadow-xl overflow-hidden bg-white relative">
              {userAvatar ? <img src={userAvatar} className="w-full h-full object-cover" alt="avatar" /> : <div className="w-full h-full flex items-center justify-center text-slate-300 text-3xl">👤</div>}
              <button onClick={() => avatarFileRef.current?.click()} className="absolute inset-0 bg-black/50 md:opacity-0 md:group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-black uppercase tracking-tighter transition-all">Change</button>
            </div>
          </div>
        </div>

        <div className="pt-10 px-4 pb-6 sm:pt-14 sm:px-10 sm:pb-10 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 text-left overflow-visible h-auto">
          <div className="md:col-span-8 space-y-8 overflow-visible h-auto">
            <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none">{card.title}</h2>
            <div className="flex flex-wrap gap-6 items-start">
              {members.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Members</p>
                  <div className="flex flex-wrap gap-2">{members.map((src, i) => <img key={i} src={src} className="w-9 h-9 rounded-full border-2 border-white shadow-md object-cover hover:scale-110 transition-transform" alt="member" />)}</div>
                </div>
              )}
              {selectedLabels.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Labels</p>
                  <div className="flex flex-wrap gap-2">{selectedLabels.map(id => <span key={id} className={`${availableLabels.find(l => l.id === id)?.color} text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase shadow-sm`}>{availableLabels.find(l => l.id === id)?.text}</span>)}</div>
                </div>
              )}
              {selectedFullDate && (
                <div className="space-y-2 cursor-pointer group" onClick={() => setShowDatePicker(true)}>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Due Date</p>
                  <div className="flex flex-col gap-1 bg-white border-2 border-cyan-500/10 px-4 py-2 rounded-xl shadow-sm group-hover:border-cyan-500 transition-all">
                    <span className="text-cyan-600 text-[10px] font-black uppercase ">📅 {selectedFullDate.range} at {selectedFullDate.time}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-cyan-600 uppercase tracking-widest px-1">📝 Description</label>
              <textarea className="w-full bg-transparent border-2 border-transparent rounded-[24px] p-5 min-h-[120px] text-slate-800 focus:bg-white focus:border-cyan-400 transition-all outline-none text-sm placeholder:text-slate-400 shadow-inner" placeholder="Add description..." value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            {attachments.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <label className="text-[11px] font-black text-slate-800 uppercase tracking-widest px-1 flex items-center gap-2 italic">📎 Attachments</label>
                <div className="grid grid-cols-1 gap-3 h-auto">
                  {attachments.map((file, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-slate-200 cursor-pointer shadow-sm group">
                      <div className="w-20 h-14 bg-slate-300 rounded-xl flex items-center justify-center text-[10px] font-black text-slate-500 uppercase shadow-inner group-hover:bg-cyan-100 group-hover:text-cyan-600 transition-colors">{file.type}</div>
                      <div className="flex flex-col flex-1">
                        <span className="text-sm font-black text-slate-800 underline underline-offset-2">{file.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{file.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeChecklist && (
              <div className="space-y-4 pt-4 border-t border-slate-200 h-auto">
                <div className="flex items-center justify-between"><label className="text-[10px] font-black text-slate-800 uppercase tracking-widest px-1">✅ {activeChecklist.title}</label><button onClick={() => setActiveChecklist(null)} className="text-[9px] text-rose-500 font-black uppercase">Delete</button></div>
                <div className="h-1.5 w-full bg-white rounded-full overflow-hidden shadow-inner"><div className="h-full bg-cyan-500 transition-all duration-700" style={{ width: `${progress}%` }}></div></div>
                <div className="space-y-2 h-auto">
                  {activeChecklist.items.map(item => (
                    <div key={item.id} className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleItem(item.id)}>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${item.completed ? 'bg-cyan-500 border-cyan-500 shadow-sm' : 'bg-white border-slate-300 group-hover:border-cyan-400'}`}>{item.completed && <span className="text-white text-[10px]">✓</span>}</div>
                      <span className={`text-sm font-bold ${item.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{item.text}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input className="flex-1 bg-white border-2 border-transparent rounded-xl px-4 py-2.5 text-sm text-slate-800 outline-none h-11 shadow-sm focus:border-cyan-400 transition-all" placeholder="Add item..." value={newItemText} onChange={(e) => setNewItemText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addItem()}/>
                  <button onClick={addItem} className="bg-cyan-500 text-white px-5 rounded-xl text-[10px] font-black uppercase shadow-md h-11 transition-all active:scale-95">Add</button>
                </div>
              </div>
            )}

            <div className="pt-8 border-t border-slate-200 space-y-6 h-auto min-h-fit">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3"><span className="text-xl">💬</span><h3 className="text-sm font-black text-slate-800 uppercase">Activity</h3></div>
                <button className="bg-white border border-slate-200 text-slate-600 text-[10px] font-black px-4 py-2 rounded-xl uppercase shadow-sm">Show Details</button>
              </div>
              <div className="flex gap-4">
                <div className="w-9 h-9 rounded-full bg-cyan-500 shrink-0 overflow-hidden shadow-md"></div>
                <div className="flex-1 space-y-3">
                  <div className="relative group h-auto">
                    <textarea className="w-full bg-white border-2 border-transparent rounded-2xl p-4 text-sm text-slate-800 focus:border-cyan-400 transition-all outline-none shadow-sm min-h-[60px]" placeholder="Write a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} />
                    <div className="flex justify-between items-center mt-2">
                      <button onClick={addComment} className="bg-white border border-slate-200 text-slate-400 text-[10px] font-black px-6 py-2 rounded-lg uppercase shadow-sm hover:bg-cyan-500 hover:text-white transition-all">Save</button>
                      <div className="flex gap-3 text-slate-400 text-lg"><span>📎</span><span>@</span><span>😊</span></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-6 pt-4 h-auto">
                {activities.map(act => (
                  <div key={act.id} className="flex gap-4 items-start animate-in fade-in h-auto">
                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500 uppercase">{act.user[0]}</div>
                    <div className="flex flex-col"><p className="text-sm text-slate-700"><span className="font-black text-slate-900">{act.user}</span> {act.action}</p><span className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tight">{act.time}</span></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-slate-200">
              <button onClick={onClose} className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-400 text-white text-[11px] font-black px-12 py-4 rounded-[22px] border-b-4 border-cyan-700 active:border-b-0 uppercase shadow-xl shadow-cyan-500/30 text-center justify-center">Save changes</button>
            </div>
          </div>

          <div className="md:col-span-4 space-y-4 shrink-0 h-auto relative overflow-visible">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 text-left">Add to card</h3>
            <div className="flex flex-col gap-3 relative z-30">
              {actionButtons.map((btn) => (
                <div key={btn.id} className="relative flex flex-col">
                  <button onClick={btn.action} className="w-full text-left px-4 py-3 bg-[#e8e9ec] hover:bg-[#dcdfe4] rounded-2xl text-[10px] font-black text-slate-600 flex items-center gap-3 transition-all group shadow-sm">
                    <span className="text-lg group-hover:scale-110 transition-transform">{btn.icon}</span>{btn.label}
                  </button>

                  {btn.id === 'attachment' && showAttachmentPicker && (
                    <div className="w-full max-w-[300px] bg-white border-2 border-cyan-400 rounded-3xl shadow-2xl p-4 sm:p-6 z-[100] mt-2 relative md:absolute md:top-0 md:right-full md:mr-4 animate-in slide-in-from-right-4">
                        <div className="flex justify-between items-center mb-4"><span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Attach from...</span><button onClick={() => setShowAttachmentPicker(false)} className="text-slate-400">✕</button></div>
                        <button onClick={() => attachFileRef.current?.click()} className="w-full bg-[#f1f2f4] hover:bg-cyan-50 text-slate-600 text-[10px] font-black py-4 rounded-2xl mb-4 border-2 border-dashed border-slate-300 hover:border-cyan-400 transition-all uppercase">Computer</button>
                        <div className="space-y-4 text-left border-t border-slate-100 pt-4">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Attach a link</label>
                                <input type="text" className="w-full bg-[#f1f2f4] border-2 border-transparent rounded-xl px-4 py-2.5 text-xs outline-none focus:bg-white focus:border-cyan-400 shadow-inner text-slate-800 font-bold" placeholder="Paste link here..." value={linkInput} onChange={(e) => setLinkInput(e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-500 uppercase ml-1">Display name (optional)</label>
                                <input type="text" className="w-full bg-[#f1f2f4] border-2 border-transparent rounded-xl px-4 py-2.5 text-xs outline-none focus:bg-white focus:border-cyan-400 shadow-inner text-slate-800 font-bold" placeholder="Text to display" value={linkName} onChange={(e) => setLinkName(e.target.value)} />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                              <button onClick={() => { setShowAttachmentPicker(false); setLinkInput(""); setLinkName(""); }} className="text-[10px] font-black text-slate-400 uppercase px-4 py-2 hover:text-slate-600 transition-colors">Cancel</button>
                              <button onClick={handleAttachLink} className="bg-cyan-500 text-white text-[10px] font-black px-6 py-2 rounded-xl shadow-lg uppercase hover:bg-cyan-400 transition-all">Attach</button>
                            </div>
                        </div>
                    </div>
                  )}

                  {btn.id === 'dates' && showDatePicker && (
                    <div className="w-full max-w-[300px] bg-white border-2 border-cyan-500 rounded-3xl shadow-2xl p-4 sm:p-5 z-[100] mt-2 relative md:absolute md:top-0 md:right-full md:mr-4 animate-in zoom-in-95">
                        <p className="text-[10px] font-black text-cyan-600 uppercase mb-4 text-center tracking-widest">Set Dates</p>
                        <div className="bg-[#f1f2f4] rounded-xl p-3 mb-5 shadow-inner text-center h-auto">
                            <div className="flex justify-between items-center text-slate-700 mb-3 text-[10px] font-black uppercase px-2"><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span></div>
                            <div className="grid grid-cols-7 gap-1 text-center h-auto">
                               {Array.from({length: 31}).map((_, i) => {
                                 const day = i + 1;
                                 const isInRange = startDate && dueDate && day >= startDate && day <= dueDate;
                                 return <button key={i} onClick={() => handleDateClick(day)} className={`text-[10px] font-bold py-1.5 rounded-lg transition-all ${day === startDate || day === dueDate ? 'bg-cyan-500 text-white shadow-md scale-110 z-10' : isInRange ? 'bg-cyan-100 text-cyan-700 rounded-none' : 'text-slate-500 hover:bg-cyan-50'}`}>{day}</button>
                               })}
                            </div>
                        </div>
                        <div className="space-y-5 mb-6 h-auto">
                            <div className="flex flex-col gap-2 text-left h-auto">
                              <label className="flex items-center gap-2 cursor-pointer group h-auto">
                                <input type="checkbox" checked={hasStartDate} onChange={() => setHasStartDate(!hasStartDate)} className="accent-cyan-500 w-4 h-4 rounded" />
                                <span className="text-[9px] font-black text-slate-500 uppercase group-hover:text-cyan-600 transition-colors">Start Date</span>
                              </label>
                              {hasStartDate && <input type="text" value={startDate ? `${startDate < 10 ? '0'+startDate : startDate}.01.2026` : ""} readOnly className="bg-[#f1f2f4] border-2 border-transparent text-[11px] text-slate-800 font-black px-4 py-2 rounded-xl w-full outline-none shadow-sm" />}
                            </div>
                            <div className="flex flex-col gap-2 text-left h-auto">
                              <label className="flex items-center gap-2 cursor-pointer group h-auto">
                                <input type="checkbox" checked={hasDueDate} onChange={() => setHasDueDate(!hasDueDate)} className="accent-cyan-500 w-4 h-4 rounded" />
                                <span className="text-[9px] font-black text-slate-500 uppercase group-hover:text-cyan-600 transition-colors">Due Date</span>
                              </label>
                              {hasDueDate && <div className="flex gap-2 h-auto"><input type="text" value={dueDate ? `${dueDate < 10 ? '0'+dueDate : dueDate}.01.2026` : ""} readOnly className="bg-[#f1f2f4] border-2 border-transparent text-[11px] text-slate-800 font-black px-4 py-2 rounded-xl flex-1 outline-none shadow-sm h-10" /><input type="text" value={tempTime} onChange={(e) => setTempTime(e.target.value)} className="bg-[#f1f2f4] border-2 border-transparent text-[11px] text-slate-800 font-black px-2 py-2 rounded-xl w-20 text-center outline-none focus:border-cyan-400 shadow-sm h-10" /></div>}
                            </div>
                            <div className="space-y-2 text-left h-auto"><p className="text-[9px] font-black text-slate-400 uppercase italic">Set Reminder</p>
                              <select value={reminder} onChange={(e) => setReminder(e.target.value)} className="w-full bg-[#f1f2f4] border-2 border-transparent text-[11px] text-slate-800 font-black px-4 py-2.5 rounded-xl outline-none shadow-sm">
                                <option>1 day before</option><option>At time of due date</option><option>None</option>
                              </select>
                            </div>
                        </div>
                        <button onClick={() => { setSelectedFullDate({range: `${startDate ? startDate : ''}${startDate && dueDate ? ' - ' : ''}${dueDate ? dueDate : ''} Jan`, time: tempTime, reminder}); setShowDatePicker(false); }} className="w-full bg-cyan-500 hover:bg-cyan-400 text-white py-3.5 rounded-[18px] text-[10px] font-black uppercase shadow-lg transition-all border-b-4 border-cyan-700 active:border-b-0">Save Date</button>
                    </div>
                  )}

                  {btn.id === 'labels' && showLabels && (
                    <div className="w-full bg-white border-2 border-cyan-400 rounded-3xl shadow-2xl p-4 z-[100] mt-1 relative animate-in slide-in-from-top-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-4 text-center tracking-widest">Add Labels</p>
                      <div className="flex flex-col gap-2">{availableLabels.map(l => <button key={l.id} onClick={() => { toggleLabel(l.id); setShowLabels(false); }} className={`w-full h-11 rounded-xl flex items-center px-4 text-[10px] font-black text-white uppercase transition-all ${l.color} shadow-md hover:translate-x-1`}>{l.text}</button>)}</div>
                    </div>
                  )}

                  {btn.id === 'checklist' && isCreatingChecklist && (
                    <div className="w-full bg-white border-2 border-cyan-400 rounded-3xl shadow-2xl p-4 z-[100] mt-1 relative animate-in slide-in-from-top-2 text-left">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-3 px-1 italic">Title Checklist</p>
                      <input className="w-full bg-[#f1f2f4] border-2 border-transparent rounded-xl p-3 text-xs mb-3 text-slate-800 outline-none focus:border-cyan-400 shadow-inner transition-all font-bold placeholder:font-normal" placeholder="Checklist name..." value={checklistTitle} onChange={(e) => setChecklistTitle(e.target.value)} autoFocus />
                      <button onClick={createChecklist} className="w-full bg-cyan-500 text-white py-3 rounded-xl text-[10px] font-black uppercase shadow-lg hover:bg-cyan-400 transition-all border-b-4 border-cyan-700 active:border-b-0">Add Checklist</button>
                    </div>
                  )}

                  {btn.id === 'cover' && showCoverPicker && (
                    <div className="w-full max-w-[260px] bg-white border-2 border-cyan-400 rounded-3xl shadow-2xl p-4 sm:p-5 z-[100] mt-1 relative md:absolute md:top-0 md:right-full md:mr-4 animate-in slide-in-from-right-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-4 text-center tracking-widest">Style Cover</p>
                      <div className="grid grid-cols-4 gap-2 mb-5 h-auto">{coverOptions.map((opt, i) => <button key={i} onClick={() => { setCoverColor(opt.color); setCoverImage(null); setShowCoverPicker(false); }} className={`h-10 rounded-xl ${opt.color} hover:scale-110 transition-transform border-2 ${coverColor === opt.color && !coverImage ? 'border-slate-800 shadow-md scale-105' : 'border-transparent'}`} />)}</div>
                      <button onClick={() => coverFileRef.current?.click()} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-[20px] text-[9px] font-black uppercase text-slate-400 hover:border-cyan-500 hover:text-cyan-600 transition-all">+ Upload Photo</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}