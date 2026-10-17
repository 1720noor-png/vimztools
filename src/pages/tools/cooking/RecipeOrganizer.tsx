import { useMemo, useState } from 'react'
import { BookOpen, Plus, Trash2, Search, Heart, Pencil } from 'lucide-react'
import ToolShell from '../../../components/tools/ToolShell'
import { Button, Field, TextInput } from '../../../components/ui/Fields'
import Seo from '../../../components/ui/Seo'
import { fmtHours, toNumber, uid } from '../../../lib/numbers'

type Recipe = { id: string; name: string; cuisine: string; mins: string; note: string; fav: boolean }

export default function RecipeOrganizer() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [query, setQuery] = useState('')
  const [form, setForm] = useState({ name: '', cuisine: '', mins: '', note: '' })
  const [editing, setEditing] = useState<string | null>(null)

  const save = () => {
    if (!form.name.trim()) return
    if (editing) {
      setRecipes((r) => r.map((x) => (x.id === editing ? { ...x, ...form } : x)))
    } else {
      setRecipes((r) => [...r, { id: uid(), ...form, fav: false }])
    }
    setForm({ name: '', cuisine: '', mins: '', note: '' })
    setEditing(null)
  }

  const startEdit = (r: Recipe) => {
    setEditing(r.id)
    setForm({ name: r.name, cuisine: r.cuisine, mins: r.mins, note: r.note })
  }

  const cancelEdit = () => {
    setEditing(null)
    setForm({ name: '', cuisine: '', mins: '', note: '' })
  }

  const toggleFav = (id: string) => setRecipes((r) => r.map((x) => (x.id === id ? { ...x, fav: !x.fav } : x)))
  const remove = (id: string) => setRecipes((r) => r.filter((x) => x.id !== id))

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = q
      ? recipes.filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            r.cuisine.toLowerCase().includes(q) ||
            r.note.toLowerCase().includes(q),
        )
      : recipes
    return [...list].sort((a, b) => Number(b.fav) - Number(a.fav))
  }, [recipes, query])

  const favCount = useMemo(() => recipes.filter((r) => r.fav).length, [recipes])

  return (
    <>
      <Seo
        title="Recipe Organizer - vimz Tools"
        description="Store, search and organize your favorite recipes. Free recipe keeper app."
      />
      <ToolShell
        title="Recipe Organizer"
        description="Store, search and organize your favorite recipes."
        icon={<BookOpen className="h-6 w-6" />}
        breadcrumb="Cooking & Kitchen"
        instruction="Store and search your favorite recipes in one place."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold text-slate-800">
              {editing ? 'Edit recipe' : 'New recipe'}
            </h3>
            <div className="space-y-3">
              <Field label="Name">
                <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Perfect risotto" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Cuisine">
                  <TextInput value={form.cuisine} onChange={(e) => setForm({ ...form, cuisine: e.target.value })} placeholder="Italian" />
                </Field>
                <Field label="Time (min)">
                  <TextInput inputMode="numeric" value={form.mins} onChange={(e) => setForm({ ...form, mins: e.target.value })} />
                </Field>
              </div>
              <Field label="Notes / ingredients">
                <TextInput value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Arborio rice, stock, parmesan" />
              </Field>
              <div className="flex gap-2">
                <Button onClick={save} className="flex-1">
                  <Plus className="h-4 w-4" /> {editing ? 'Save changes' : 'Add recipe'}
                </Button>
                {editing && (
                  <Button variant="secondary" onClick={cancelEdit}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </section>

          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search recipes by name, cuisine or note…"
                className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>
            <p className="mt-3 text-xs font-semibold text-slate-400">
              {filtered.length} of {recipes.length} recipes · {favCount} favorited
            </p>

            {filtered.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
                {recipes.length === 0 ? 'No recipes saved yet.' : 'Nothing matches that search.'}
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {filtered.map((r) => (
                  <article key={r.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="truncate text-sm font-extrabold text-slate-800">{r.name}</h4>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-bold uppercase text-primary-600">
                            {r.cuisine || 'Uncategorized'}
                          </span>
                          {r.mins && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                              {fmtHours(toNumber(r.mins) || 0)}
                            </span>
                          )}
                        </div>
                      </div>
                      <button onClick={() => toggleFav(r.id)} className={`rounded-md p-1 transition ${r.fav ? 'text-rose-500' : 'text-slate-300 hover:text-rose-400'}`} aria-label="Favorite">
                        <Heart className={`h-4 w-4 ${r.fav ? 'fill-rose-500' : ''}`} />
                      </button>
                    </div>
                    {r.note && <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">{r.note}</p>}
                    <div className="mt-3 flex gap-1 border-t border-slate-100 pt-2">
                      <button onClick={() => startEdit(r)} className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-slate-500 transition hover:bg-slate-100">
                        <Pencil className="h-3 w-3" /> Edit
                      </button>
                      <button onClick={() => remove(r.id)} className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-rose-400 transition hover:bg-rose-50">
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </ToolShell>
    </>
  )
}