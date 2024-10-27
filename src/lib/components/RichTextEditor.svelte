<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  
  

  // Event dispatcher for changes
  import { createEventDispatcher } from 'svelte';
  interface Props {
    // Props
    value?: string;
    placeholder?: string;
    readonly?: boolean;
    height?: string;
  }

  let {
    value = '',
    placeholder = 'Start writing...',
    readonly = false,
    height = '400px'
  }: Props = $props();
  const dispatch = createEventDispatcher();

  // Editor references
  let Quill: any;
  let DOMPurify: any;
  let quill: any;
  let editorElement = $state();
  let isEditorReady = false;

  // Quill configuration
  const toolbarOptions = [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['blockquote', 'code-block'],
    [{ 'header': 1 }, { 'header': 2 }, { 'header': 3 }, { 'header': 4 }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }],
    // [{ 'size': ['small', false, 'large', 'huge'] }],
    [{ 'font': [] }],
    [{ 'align': [] }],
    ['link', 'image', 'video'],
    ['clean']
  ];

  // Image upload handler
  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        try {
          // Here you would typically upload the file to your server
          // and get back a URL. This is a placeholder for that process.
          const imageUrl = await uploadImage(file);
          const range = quill.getSelection();
          quill.insertEmbed(range.index, 'image', imageUrl);
        } catch (error) {
          console.error('Error uploading image:', error);
        }
      }
    };
  };

  // Image upload function (implement according to your backend)
  async function uploadImage(file: File) {
    // Implement your image upload logic here
    // Return the URL of the uploaded image
    throw new Error('Image upload not implemented');
  }

  onMount(async () => {
    if (browser) {
      // Dynamically import Quill and DOMPurify only on the client side
      const [quillModule, domPurifyModule] = await Promise.all([
        import('quill'),
        import('dompurify')
      ]);

      // Get the default export from the modules
      Quill = quillModule.default;
      DOMPurify = domPurifyModule.default;

      // Initialize Quill
      quill = new Quill(editorElement, {
        modules: {
          toolbar: {
            container: toolbarOptions,
            handlers: {
              image: imageHandler
            }
          }
        },
        placeholder,
        readOnly: readonly,
        theme: 'snow'
      });

      // Set initial content
      if (value) {
        quill.root.innerHTML = DOMPurify.sanitize(value);
      }

      // Handle content changes
      quill.on('text-change', () => {
        const content = quill.root.innerHTML;
        const sanitizedContent = DOMPurify.sanitize(content, {
          ALLOWED_TAGS: [
            'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ol', 'ul', 'li', 'blockquote', 'pre', 'code', 'a', 'img', 'video',
            'span', 'sub', 'super', 'div'
          ],
          ALLOWED_ATTR: [
            'href', 'src', 'alt', 'class', 'style', 'target', 'controls',
            'width', 'height'
          ],
          ALLOWED_STYLES: [
            'color', 'background-color', 'text-align', 'font-size', 'font-family',
            'margin', 'margin-left', 'padding'
          ]
        });

        dispatch('change', {
          html: sanitizedContent,
          text: quill.getText()
        });
      });

      isEditorReady = true;
    }
  });

  onDestroy(() => {
    if (quill) {
      quill = null;
    }
  });
</script>

{#if browser}
  <div class="rich-text-editor" style="height: {height}">
    <div bind:this={editorElement}></div>
  </div>
{/if}

<style>
  .rich-text-editor {
    border: 1px solid #ccc;
    border-radius: 4px;
    overflow: hidden;
  }

  .rich-text-editor :global(.ql-container) {
    height: calc(100% - 42px);
  }

  /* Add some basic styling for the toolbar */
  .rich-text-editor :global(.ql-toolbar) {
    border-bottom: 1px solid #ccc;
    background-color: #f8f8f8;
  }

  /* Style for the editor area */
  .rich-text-editor :global(.ql-editor) {
    min-height: 200px;
    font-size: 16px;
    line-height: 1.5;
  }
</style>