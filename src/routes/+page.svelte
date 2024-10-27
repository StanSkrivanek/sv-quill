
<script lang="ts">
  import { browser } from '$app/environment';
  import RichTextEditor from '$lib/components/RichTextEditor.svelte';
  import type { PageData } from './$types';
  
  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  
  let editorContent = $state({
    html: '',
    text: ''
  });

  let isSaving = $state(false);
  let saveStatus: 'idle' | 'saving' | 'success' | 'error' = $state('idle');
  let errorMessage = $state('');

  function handleContentChange(event: CustomEvent<{ html: string; text: string }>) {
    const { html, text } = event.detail;
    editorContent = { html, text };
  }

  async function handleSave() {
    if (!editorContent.html.trim()) {
      errorMessage = 'Content cannot be empty';
      saveStatus = 'error';
      return;
    }

    if (browser) {
      try {
        saveStatus = 'saving';
        isSaving = true;
        
        const formData = new FormData();
        formData.append('html', editorContent.html);
        formData.append('text', editorContent.text);
        
        const response = await fetch('?/saveContent', {
          method: 'POST',
          body: formData
        });
        
        const result = await response.json();
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        saveStatus = 'success';
        setTimeout(() => {
          saveStatus = 'idle';
        }, 3000);
      } catch (error) {
        console.error('Error saving content:', error);
        saveStatus = 'error';
        errorMessage = error instanceof Error ? error.message : 'Failed to save content';
      } finally {
        isSaving = false;
      }
    }
  }
</script>

<svelte:head>
  {#if browser}
    <link href="https://cdn.quilljs.com/1.3.7/quill.snow.css" rel="stylesheet">
  {/if}
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-4xl">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold text-gray-900">Rich Text Editor</h1>
    
    <div class="flex items-center gap-4">
      {#if saveStatus === 'success'}
        <span class="text-green-600 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          Saved successfully
        </span>
      {/if}
      {#if saveStatus === 'error'}
        <span class="text-red-600 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          {errorMessage}
        </span>
      {/if}
      
      <button
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
               disabled:opacity-50 disabled:cursor-not-allowed
               transition-colors duration-200 flex items-center gap-2"
        onclick={handleSave}
        disabled={isSaving || !editorContent.html.trim()}
      >
        {#if isSaving}
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Saving...
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h-2v5.586l-1.293-1.293z" />
            <path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
          </svg>
          Save
        {/if}
      </button>
    </div>
  </div>
  
  {#if browser}
    <div class="bg-white shadow-lg rounded-lg overflow-hidden">
      <RichTextEditor
        value={editorContent.html}
        placeholder="Write your content here..."
        on:change={handleContentChange}
      />
    </div>
  {/if}
</div>