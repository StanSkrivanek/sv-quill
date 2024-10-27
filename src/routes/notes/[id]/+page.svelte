<script lang="ts">
    import { goto } from '$app/navigation';
    import type { PageData } from './$types';

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();

    function formatDate(dateString: string) {
        return new Date(dateString).toLocaleString();
    }

    function handleBackToList() {
        goto('/notes');
    }
</script>

<div class="container mx-auto px-4 py-8 max-w-4xl">
    <div class="mb-8 flex items-center justify-between">
        <button
            onclick={handleBackToList}
            class="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 
                   bg-gray-100 hover:bg-gray-200 rounded-md transition-colors
                   focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" 
                      d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" 
                      clip-rule="evenodd" />
            </svg>
            Back to List
        </button>

        <div class="text-sm text-gray-500">
            {#if data.note.created_at}
                Created: {formatDate(data.note.created_at)}
            {/if}
            {#if data.note.updated_at && data.note.updated_at !== data.note.created_at}
                <span class="mx-2">•</span>
                Updated: {formatDate(data.note.updated_at)}
            {/if}
        </div>
    </div>

    <div class="bg-white shadow-lg rounded-lg overflow-hidden">
        <div class="p-6">
            <article class="prose prose-lg max-w-none">
                {@html data.note.html}
            </article>
        </div>
    </div>
</div>

<style>
    /* Enhance typography for the note content */
    :global(.prose) {
        max-width: none;
    }

    :global(.prose h1) {
        color: #1a202c;
        font-weight: 800;
        font-size: 2.25em;
        margin-top: 0;
        margin-bottom: 0.8888889em;
        line-height: 1.1111111;
    }

    :global(.prose h2) {
        color: #1a202c;
        font-weight: 700;
        font-size: 1.5em;
        margin-top: 2em;
        margin-bottom: 1em;
        line-height: 1.3333333;
    }

    :global(.prose p) {
        margin-top: 1.25em;
        margin-bottom: 1.25em;
    }

    :global(.prose a) {
        color: rgb(234, 88, 12);
        text-decoration: underline;
        font-weight: 500;
    }

    :global(.prose strong) {
        color: #1a202c;
        font-weight: 600;
    }

    :global(.prose ul) {
        margin-top: 1.25em;
        margin-bottom: 1.25em;
        padding-left: 1.625em;
    }

    :global(.prose li) {
        margin-top: 0.5em;
        margin-bottom: 0.5em;
    }

    :global(.prose blockquote) {
        font-weight: 500;
        font-style: italic;
        color: #1a202c;
        border-left-width: 0.25rem;
        border-left-color: #e5e7eb;
        quotes: "\\201C""\\201D""\\2018""\\2019";
        margin-top: 1.6em;
        margin-bottom: 1.6em;
        padding-left: 1em;
    }

    :global(.prose code) {
        color: #1a202c;
        font-weight: 600;
        font-size: 0.875em;
    }

    :global(.prose pre) {
        color: #e5e7eb;
        background-color: #1a202c;
        overflow-x: auto;
        font-size: 0.875em;
        line-height: 1.7142857;
        margin-top: 1.7142857em;
        margin-bottom: 1.7142857em;
        border-radius: 0.375rem;
        padding: 0.8571429em 1.1428571em;
    }

    :global(.prose img) {
        margin-top: 2em;
        margin-bottom: 2em;
        border-radius: 0.375rem;
    }

    :global(.prose video) {
        margin-top: 2em;
        margin-bottom: 2em;
        border-radius: 0.375rem;
    }
</style>