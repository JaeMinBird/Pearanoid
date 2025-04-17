<script lang="ts">
	import { onMount } from 'svelte';
	import { vaultStore, isLocked, sections } from '$lib/stores/vaultStore';
	import { generatePassword } from '$lib/services/crypto';
	import { goto } from '$app/navigation';

	// Redirect if vault is locked
	onMount(() => {
		if ($isLocked) {
			goto('/');
		}
	});

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
	let showPasswordForm = false;
	let passwordOptions = {
		length: 16,
		includeUppercase: true,
		includeLowercase: true,
		includeNumbers: true,
		includeSymbols: true
	};
	
	// Loading state
	let saving = false;

	// Generate password
	function handleGeneratePassword() {
		newCredential.password = generatePassword(
			passwordOptions.length,
			passwordOptions.includeUppercase,
			passwordOptions.includeLowercase,
			passwordOptions.includeNumbers,
			passwordOptions.includeSymbols
		);
	}
	
	// Add new credential
	async function handleAddCredential() {
		if (!newCredential.name || !newCredential.password) {
			alert('Name and password are required');
			return;
		}
		
		saving = true;
		
		try {
			// Add entry
			await vaultStore.addEntry({
				name: newCredential.name,
				username: newCredential.username,
				email: newCredential.email,
				password: newCredential.password,
				section: newCredential.section || undefined,
				notes: newCredential.notes || undefined
			});
			
			// Navigate back to home
			goto('/');
		} catch (err) {
			console.error('Error saving credential:', err);
			alert('Failed to save credential');
		} finally {
			saving = false;
		}
	}
</script>

<div class="max-w-3xl mx-auto space-y-6">
	<div class="flex items-center">
		<a href="/" class="text-secondary hover:text-secondary/80 mr-4 flex items-center">
			<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
				<path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
			</svg>
			Back
		</a>
		<h1 class="text-3xl font-display font-bold">Add Password</h1>
	</div>
	
	<div class="card p-6">
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
						{showPasswordForm ? 'Hide Generator' : 'Generate Password'}
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
				<a href="/" class="btn-outline">
					Cancel
				</a>
				<button 
					type="submit" 
					class="btn-primary"
					disabled={saving}
				>
					{#if saving}
						<span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
						Saving...
					{:else}
						Save Password
					{/if}
				</button>
			</div>
		</form>
	</div>
</div> 