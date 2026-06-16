'use client';

import { useActionState, useRef, useState } from 'react';
import { Bold, Heading2, Heading3, Italic, List, ListOrdered, Quote, Send } from 'lucide-react';

import { publishPostAction, type WriteActionState } from './actions';

const initialState: WriteActionState = {};

const toolbar = [
	{ label: 'Bold', icon: Bold, command: 'bold' },
	{ label: 'Italic', icon: Italic, command: 'italic' },
	{ label: 'Heading 2', icon: Heading2, command: 'formatBlock', value: 'h2' },
	{ label: 'Heading 3', icon: Heading3, command: 'formatBlock', value: 'h3' },
	{ label: 'Quote', icon: Quote, command: 'formatBlock', value: 'blockquote' },
	{ label: 'Bulleted list', icon: List, command: 'insertUnorderedList' },
	{ label: 'Numbered list', icon: ListOrdered, command: 'insertOrderedList' },
];

export default function WriteEditor() {
	const editorRef = useRef<HTMLDivElement>(null);
	const [title, setTitle] = useState('');
	const [content, setContent] = useState('');
	const [state, formAction, pending] = useActionState(publishPostAction, initialState);

	const syncContent = () => {
		setContent(editorRef.current?.innerHTML || '');
	};

	const runCommand = (command: string, value?: string) => {
		document.execCommand(command, false, value);
		editorRef.current?.focus();
		syncContent();
	};

	return (
		<form action={formAction} className="min-h-screen bg-white text-neutral-900">
			<header className="sticky top-16 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur">
				<div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
					<p className="text-sm text-neutral-500">Draft story</p>
					<div className="flex items-center gap-3">
						<button
							type="submit"
							name="status"
							value="draft"
							disabled={pending}
							className="rounded-full px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-100 disabled:opacity-50"
						>
							Save draft
						</button>
						<button
							type="submit"
							name="status"
							value="published"
							disabled={pending}
							className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
						>
							<Send className="size-4" />
							{pending ? 'Publishing...' : 'Publish'}
						</button>
					</div>
				</div>
			</header>

			<input type="hidden" name="content" value={content} />

			<main className="mx-auto max-w-3xl px-6 py-12">
				<label htmlFor="story-title" className="sr-only">
					Story title
				</label>
				<textarea
					id="story-title"
					name="title"
					value={title}
					onChange={(event) => setTitle(event.target.value)}
					placeholder="Title"
					rows={1}
					className="min-h-20 w-full resize-none border-0 bg-transparent font-serif text-5xl leading-tight text-neutral-950 outline-none placeholder:text-neutral-300 sm:text-6xl"
				/>

				<div className="sticky top-32 z-30 mt-8 flex w-fit gap-1 rounded-full border border-neutral-200 bg-white p-1 shadow-sm">
					{toolbar.map((item) => {
						const Icon = item.icon;

						return (
							<button
								key={item.label}
								type="button"
								onClick={() => runCommand(item.command, item.value)}
								className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950"
								aria-label={item.label}
								title={item.label}
							>
								<Icon className="size-4" />
							</button>
						);
					})}
				</div>

				<div
					ref={editorRef}
					contentEditable
					suppressContentEditableWarning
					onInput={syncContent}
					onBlur={syncContent}
					data-placeholder="Tell your story..."
					className="prose prose-xl mt-10 max-w-none bg-white font-serif text-neutral-900 outline-none prose-neutral prose-headings:font-sans prose-headings:font-semibold prose-headings:text-neutral-950 prose-p:leading-9 prose-p:text-neutral-900 prose-strong:text-neutral-950 prose-blockquote:border-l-[6px] prose-blockquote:border-neutral-950 prose-blockquote:pl-6 prose-blockquote:text-2xl prose-blockquote:italic prose-pre:rounded-md prose-pre:bg-neutral-950 prose-pre:text-neutral-100 empty:before:pointer-events-none empty:before:text-neutral-300 empty:before:content-[attr(data-placeholder)] focus:outline-none focus:ring-0"
				/>

				{state.error && (
					<p className="mt-8 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
						{state.error}
					</p>
				)}
			</main>
		</form>
	);
}
