<script lang="ts">
	import { entries, sections, vaultStore } from '$lib/stores/vaultStore';
	import { generatePassword } from '$lib/services/crypto';
	import { onMount } from 'svelte';

	// State
	let searchTerm = '';
	let currentSection: string | null = null;
	let showAddForm = false;
	let showPasswordForm = false;
	
	// New credential form
	let newCredential = {
		name: '',
		username: '',
		email: '',
		password: '',
		section: '',
		notes: ''
	};
	
	// Password generation options
	let passwordOptions = {
		length: 16,
		includeUppercase: true,
		includeLowercase: true,
		includeNumbers: true,
		includeSymbols: true
	};
	
	// Filter credentials based on search and section
	$: filteredEntries = $entries.filter(entry => {
		// Filter by search term
		const matchesSearch = searchTerm === '' || 
			entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(entry.username && entry.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
			(entry.email && entry.email.toLowerCase().includes(searchTerm.toLowerCase()));
		
		// Filter by section
		const matchesSection = currentSection === null || entry.section === currentSection;
		
		return matchesSearch && matchesSection;
	});
	
	// Reset activity timer on user interaction
	function updateActivity() {
		vaultStore.updateActivity();
	}
	
	// Show password temporarily
	function togglePasswordVisibility(element: HTMLElement, passwordText: string) {
		// Store original content
		const originalContent = element.innerHTML;
		
		// Show password
		element.textContent = passwordText;
		
		// After 3 seconds, hide password again
		setTimeout(() => {
			element.innerHTML = originalContent;
		}, 3000);
		
		// Update activity
		updateActivity();
	}
	
	// Copy password to clipboard
	async function copyToClipboard(text: string) {
		try {
			await navigator.clipboard.writeText(text);
			alert('Copied to clipboard!');
		} catch (err) {
			console.error('Failed to copy: ', err);
		}
		
		// Update activity
		updateActivity();
	}
	
	// Generate password
	function handleGeneratePassword() {
		newCredential.password = generatePassword(
			passwordOptions.length,
			passwordOptions.includeUppercase,
			passwordOptions.includeLowercase,
			passwordOptions.includeNumbers,
			passwordOptions.includeSymbols
		);
		
		// Update activity
		updateActivity();
	}
	
	// Add new credential
	async function handleAddCredential() {
		if (!newCredential.name || !newCredential.password) {
			alert('Name and password are required');
			return;
		}
		
		// Add entry
		await vaultStore.addEntry({
			name: newCredential.name,
			username: newCredential.username,
			email: newCredential.email,
			password: newCredential.password,
			section: newCredential.section || undefined,
			notes: newCredential.notes || undefined
		});
		
		// Reset form
		newCredential = {
			name: '',
			username: '',
			email: '',
			password: '',
			section: '',
			notes: ''
		};
		
		// Hide form
		showAddForm = false;
		
		// Update activity
		updateActivity();
	}
	
	// Delete credential
	async function handleDeleteCredential(id: string) {
		if (!confirm('Are you sure you want to delete this credential?')) {
			return;
		}
		
		await vaultStore.deleteEntry(id);
		
		// Update activity
		updateActivity();
	}
	
	// Initialize the component
	onMount(() => {
		// Update activity to prevent auto-lock
		updateActivity();
		
		// Listen for keydown events to update activity
		const handleKeyDown = () => updateActivity();
		window.addEventListener('keydown', handleKeyDown);
		
		// Clean up event listener
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	});
</script>

<div class="space-y-6" on:click={updateActivity} on:keydown={updateActivity}>
	<!-- Top Controls -->
	<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
		<h1 class="text-3xl font-display font-bold">Password Vault</h1>
		
		<button class="btn-primary" on:click={() => showAddForm = true}>
			<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
				<path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
			</svg>
			Add Credential
		</button>
	</div>
	
	<!-- Search and Filters -->
	<div class="card p-4">
		<div class="flex flex-col md:flex-row gap-4">
			<div class="w-full md:w-2/3">
				<label for="search" class="block text-sm font-medium text-neutral-700 mb-1">Search</label>
				<input
					type="text"
					id="search"
					placeholder="Search passwords..."
					class="retro-input"
					bind:value={searchTerm}
				/>
			</div>
			
			<div class="w-full md:w-1/3">
				<label for="section" class="block text-sm font-medium text-neutral-700 mb-1">Section</label>
				<select id="section" class="retro-input" bind:value={currentSection}>
					<option value={null}>All Sections</option>
					{#each $sections as section}
						<option value={section}>{section}</option>
					{/each}
				</select>
			</div>
		</div>
	</div>
	
	<!-- Add Credential Form -->
	{#if showAddForm}
		<div class="card p-6">
			<div class="flex justify-between items-center mb-4">
				<h2 class="text-xl font-display font-medium">Add New Credential</h2>
				<button class="text-neutral-500 hover:text-neutral-700" on:click={() => showAddForm = false}>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
					</svg>
				</button>
			</div>
			
			<form on:submit|preventDefault={handleAddCredential} class="space-y-4">
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="name" class="block text-sm font-medium text-neutral-700 mb-1">
							Name <span class="text-primary">*</span>
						</label>
						<input
							type="text"
							id="name"
							required
							bind:value={newCredential.name}
							class="retro-input"
							placeholder="e.g. Gmail"
						/>
					</div>
					
					<div>
						<label for="section" class="block text-sm font-medium text-neutral-700 mb-1">
							Section
						</label>
						<input
							type="text"
							id="section"
							bind:value={newCredential.section}
							class="retro-input"
							placeholder="e.g. Personal, Work"
							list="existing-sections"
						/>
						<datalist id="existing-sections">
							{#each $sections as section}
								<option value={section} />
							{/each}
						</datalist>
					</div>
				</div>
				
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label for="username" class="block text-sm font-medium text-neutral-700 mb-1">
							Username
						</label>
						<input
							type="text"
							id="username"
							bind:value={newCredential.username}
							class="retro-input"
							placeholder="Your username"
						/>
					</div>
					
					<div>
						<label for="email" class="block text-sm font-medium text-neutral-700 mb-1">
							Email
						</label>
						<input
							type="email"
							id="email"
							bind:value={newCredential.email}
							class="retro-input"
							placeholder="Your email"
						/>
					</div>
				</div>
				
				<div>
					<div class="flex justify-between items-center">
						<label for="password" class="block text-sm font-medium text-neutral-700 mb-1">
							Password <span class="text-primary">*</span>
						</label>
						<button 
							type="button" 
							class="text-xs text-secondary hover:text-secondary/80"
							on:click={() => showPasswordForm = !showPasswordForm}
						>
							Generate
						</button>
					</div>
					<input
						type="password"
						id="password"
						required
						bind:value={newCredential.password}
						class="retro-input"
						placeholder="Your secure password"
					/>
				</div>
				
				{#if showPasswordForm}
					<div class="bg-neutral-50 p-4 rounded border border-neutral-300">
						<h3 class="text-sm font-medium mb-2">Password Generator</h3>
						
						<div class="grid grid-cols-2 gap-4 mb-3">
							<div>
								<label for="pwLength" class="block text-xs font-medium text-neutral-700 mb-1">
									Length: {passwordOptions.length}
								</label>
								<input 
									type="range" 
									id="pwLength" 
									min="8" 
									max="32" 
									bind:value={passwordOptions.length} 
									class="w-full"
								/>
							</div>
							
							<div class="flex flex-col justify-end">
								<div class="flex items-center">
									<input 
										type="checkbox" 
										id="uppercase" 
										bind:checked={passwordOptions.includeUppercase} 
										class="retro-checkbox"
									/>
									<label for="uppercase" class="ml-2 block text-xs text-neutral-700">
										Uppercase (A-Z)
									</label>
								</div>
								
								<div class="flex items-center mt-1">
									<input 
										type="checkbox" 
										id="lowercase" 
										bind:checked={passwordOptions.includeLowercase} 
										class="retro-checkbox"
									/>
									<label for="lowercase" class="ml-2 block text-xs text-neutral-700">
										Lowercase (a-z)
									</label>
								</div>
								
								<div class="flex items-center mt-1">
									<input 
										type="checkbox" 
										id="numbers" 
										bind:checked={passwordOptions.includeNumbers} 
										class="retro-checkbox"
									/>
									<label for="numbers" class="ml-2 block text-xs text-neutral-700">
										Numbers (0-9)
									</label>
								</div>
								
								<div class="flex items-center mt-1">
									<input 
										type="checkbox" 
										id="symbols" 
										bind:checked={passwordOptions.includeSymbols} 
										class="retro-checkbox"
									/>
									<label for="symbols" class="ml-2 block text-xs text-neutral-700">
										Symbols (!@#$%...)
									</label>
								</div>
							</div>
						</div>
						
						<button
							type="button"
							class="btn-secondary w-full text-sm py-1"
							on:click={handleGeneratePassword}
						>
							Generate Password
						</button>
					</div>
				{/if}
				
				<div>
					<label for="notes" class="block text-sm font-medium text-neutral-700 mb-1">
						Notes
					</label>
					<textarea
						id="notes"
						rows="3"
						bind:value={newCredential.notes}
						class="retro-input resize-none"
						placeholder="Additional notes"
					></textarea>
				</div>
				
				<div class="pt-4 border-t border-neutral-200 flex justify-end space-x-3">
					<button 
						type="button" 
						class="btn-outline" 
						on:click={() => showAddForm = false}
					>
						Cancel
					</button>
					<button type="submit" class="btn-primary">
						Save Credential
					</button>
				</div>
			</form>
		</div>
	{/if}
	
	<!-- Credentials List -->
	<div class="card">
		{#if filteredEntries.length === 0}
			<div class="p-8 text-center">
				<p class="text-neutral-500">
					{searchTerm || currentSection 
						? 'No credentials match your search criteria.' 
						: 'No credentials found. Add your first credential to get started.'}
				</p>
			</div>
		{:else}
			<div class="divide-y divide-neutral-200">
				{#each filteredEntries as entry}
					<div class="p-4 hover:bg-neutral-50">
						<div class="flex justify-between">
							<div>
								<div class="flex items-center">
									<h3 class="font-medium">{entry.name}</h3>
									{#if entry.section}
										<span class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-800">
											{entry.section}
										</span>
									{/if}
								</div>
								
								{#if entry.username}
									<p class="text-sm text-neutral-600 mt-1">
										<span class="font-medium">Username:</span> {entry.username}
									</p>
								{/if}
								
								{#if entry.email}
									<p class="text-sm text-neutral-600 mt-1">
										<span class="font-medium">Email:</span> {entry.email}
									</p>
								{/if}
								
								<div class="text-sm text-neutral-600 mt-1 flex items-center">
									<span class="font-medium mr-1">Password:</span> 
									<span class="inline-flex items-center" id={`password-${entry.id}`}>••••••••</span>
									<div class="ml-2 flex space-x-1">
										<button 
											class="text-secondary hover:text-secondary/80 p-1"
											on:click={(e) => togglePasswordVisibility(
												document.getElementById(`password-${entry.id}`) as HTMLElement, 
												entry.password
											)}
											title="Show password"
										>
											<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
												<path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
												<path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
											</svg>
										</button>
										<button 
											class="text-secondary hover:text-secondary/80 p-1"
											on:click={() => copyToClipboard(entry.password)}
											title="Copy password"
										>
											<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
												<path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
												<path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
											</svg>
										</button>
									</div>
								</div>
								
								{#if entry.notes}
									<div class="mt-2 text-xs bg-neutral-50 p-2 rounded border border-neutral-200">
										<p class="whitespace-pre-line">{entry.notes}</p>
									</div>
								{/if}
							</div>
							
							<div>
								<button 
									class="text-primary hover:text-primary/80 p-1"
									on:click={() => handleDeleteCredential(entry.id)}
									title="Delete"
								>
									<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
										<path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
									</svg>
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div> 