<script lang="ts">
	import { onMount } from 'svelte';
	import { vaultStore, isLocked, isInitialized, vaultError, isLoading, entries } from '$lib/stores/vaultStore';

	// Form state
	let masterPassword = '';
	let confirmPassword = '';
	let showCreateNewPrompt = false;
	let searchTerm = '';

	// Focus management
	let passwordInput: HTMLInputElement;

	// Animation mount logic for stats
	onMount(() => {
		// This would be where we'd add animations if needed
		// Focus the password input when the component mounts
		if (passwordInput) {
			passwordInput.focus();
		}
	});

	// Handle login form submission
	async function handleLogin(event: SubmitEvent) {
		event.preventDefault();
		
		if (!masterPassword) return;
		
		// If this is a new vault, confirm password is required
		if (showCreateNewPrompt && masterPassword !== confirmPassword) {
			alert('Passwords do not match');
			return;
		}
		
		await vaultStore.unlock(masterPassword);
		
		// Clear the password fields
		masterPassword = '';
		confirmPassword = '';
	}

	// Filter passwords based on search term
	$: filteredEntries = $entries.filter(entry => {
		if (!searchTerm) return true;
		
		return (
			entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(entry.username && entry.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
			(entry.email && entry.email.toLowerCase().includes(searchTerm.toLowerCase()))
		);
	});
</script>

{#if $isLocked}
	<div class="max-w-md mx-auto">
		<div class="card p-8">
			<div class="flex flex-col items-center mb-6">
				<div class="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mb-4">
					<span class="text-white font-mono font-bold text-3xl">P</span>
				</div>
				<h1 class="text-2xl font-display font-bold text-center">Pearanoid</h1>
				<p class="text-neutral-600 text-center mt-2">Your secure password vault</p>
			</div>
			
			{#if $vaultError}
				<div class="bg-red-50 border border-red-200 text-red-800 rounded p-3 mb-4">
					<p class="text-sm">{$vaultError}</p>
				</div>
			{/if}
			
			<form on:submit={handleLogin} class="space-y-4">
				<div>
					<label for="masterPassword" class="block text-sm font-medium text-neutral-700 mb-1">
						Master Password
					</label>
					<input
						id="masterPassword"
						type="password"
						bind:value={masterPassword}
						bind:this={passwordInput}
						class="retro-input"
						placeholder="Enter your master password"
						required
					/>
				</div>
				
				{#if showCreateNewPrompt}
					<div>
						<label for="confirmPassword" class="block text-sm font-medium text-neutral-700 mb-1">
							Confirm Master Password
						</label>
						<input
							id="confirmPassword"
							type="password"
							bind:value={confirmPassword}
							class="retro-input"
							placeholder="Confirm your master password"
							required
						/>
					</div>
					
					<div class="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
						<p class="mb-1 font-medium">Creating a new vault</p>
						<p>You're creating a new vault. Make sure to remember your master password as it cannot be recovered!</p>
					</div>
				{/if}
				
				<button
					type="submit"
					class="btn-primary w-full"
					disabled={$isLoading}
				>
					{#if $isLoading}
						<span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
						{showCreateNewPrompt ? 'Creating vault...' : 'Unlocking...'}
					{:else}
						{showCreateNewPrompt ? 'Create New Vault' : 'Unlock'}
					{/if}
				</button>
				
				{#if !showCreateNewPrompt && !$isInitialized}
					<button
						type="button"
						class="btn-outline w-full"
						on:click={() => showCreateNewPrompt = true}
					>
						Create New Vault
					</button>
				{/if}
			</form>
			
			<div class="mt-4 text-center text-xs text-neutral-500">
				<p>All encryption occurs client-side. Your master password never leaves this device.</p>
			</div>
		</div>
	</div>
{:else}
	<!-- Password List (when vault is unlocked) -->
	<div class="space-y-6">
		<!-- Top Controls -->
		<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
			<h1 class="text-3xl font-display font-bold">Password Vault</h1>
			
			<button class="btn-primary" on:click={() => window.location.href = '/add'}>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
				</svg>
				Add Password
			</button>
		</div>
		
		<!-- Search -->
		<div class="card p-4">
			<div>
				<label for="search" class="block text-sm font-medium text-neutral-700 mb-1">Search</label>
				<input
					type="text"
					id="search"
					placeholder="Search passwords..."
					class="retro-input"
					bind:value={searchTerm}
				/>
			</div>
		</div>
		
		<!-- Password List -->
		<div class="card">
			{#if $entries.length === 0}
				<div class="p-8 text-center">
					<p class="text-center text-neutral-600">
						Your vault is empty. Add your first password entry to get started.
					</p>
					<div class="flex justify-center mt-4">
						<a href="/add" class="btn-primary">Add Password Entry</a>
					</div>
				</div>
			{:else if filteredEntries.length === 0}
				<div class="p-8 text-center">
					<p class="text-neutral-500">No passwords match your search criteria.</p>
				</div>
			{:else}
				<div class="divide-y divide-neutral-200">
					{#each filteredEntries as entry}
						<div class="p-4 hover:bg-neutral-50">
							<a href={`/edit/${entry.id}`} class="block">
								<div class="flex justify-between items-center">
									<div>
										<h3 class="font-medium text-lg">{entry.name}</h3>
										{#if entry.username}
											<p class="text-sm text-neutral-600">{entry.username}</p>
										{:else if entry.email}
											<p class="text-sm text-neutral-600">{entry.email}</p>
										{/if}
									</div>
									
									{#if entry.section}
										<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
											{entry.section}
										</span>
									{/if}
								</div>
							</a>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
{/if}
