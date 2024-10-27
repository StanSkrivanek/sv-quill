
<script lang="ts">
    import { page } from '$app/stores';

    // Define navigation items
    const navItems = [
        // { href: '/', label: 'Editor', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
        { href: '/notes', label: 'Notes', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' }
    ];

    let currentPath = $derived($page.url.pathname);
</script>

<nav class="bg-white shadow-md">
    <div class="container mx-auto px-4">
        <div class="flex items-center justify-between h-16">
            <!-- Logo/Brand -->
            <div class="flex-shrink-0 flex items-center">
                <a href="/" class="text-xl font-bold text-gray-800">Simply Notes</a>
            </div>

            <!-- Navigation Links -->
            <div class="flex space-x-4">
                {#each navItems as { href, label, icon }}
                    <a
                        {href}
                        class="flex items-center px-3 py-2 rounded-md text-sm font-medium
                               transition-colors duration-150 ease-in-out
                               {currentPath === href
                                ? 'bg-orange-100 text-orange-700'
                                : 'text-gray-600 hover:bg-orange-100 hover:text-orange-900'}"
                        aria-current={currentPath === href ? 'page' : undefined}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-5 w-5 mr-1.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            stroke-width="2"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d={icon}
                            />
                        </svg>
                        {label}
                    </a>
                {/each}
            </div>
        </div>
    </div>
</nav>