<script lang="ts">
	// User preferences
	let preferences = {
		theme: 'light',
		notifications: true,
		emailNotifications: false,
		language: 'en',
		timeFormat: '24h',
		dateFormat: 'MM/DD/YYYY'
	};
	
	// Account settings
	let account = {
		name: 'John Doe',
		email: 'john.doe@example.com',
		avatar: ''
	};
	
	// Form submission handler
	function savePreferences() {
		// Here we would normally send the data to the backend API
		console.log('Saving preferences:', preferences);
		// Show success notification
		alert('Settings saved successfully!');
	}
	
	function saveAccount() {
		// Here we would normally send the data to the backend API
		console.log('Saving account:', account);
		// Show success notification
		alert('Account updated successfully!');
	}
</script>

<div class="space-y-8">
	<h1 class="text-3xl font-display font-bold">Settings</h1>
	
	<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
		<!-- Sidebar Navigation -->
		<div class="col-span-1">
			<div class="card overflow-hidden">
				<div class="bg-neutral-100 px-4 py-3 border-b border-neutral-300">
					<h2 class="font-display font-medium">Settings Menu</h2>
				</div>
				<div class="divide-y divide-neutral-200">
					<a href="#preferences" class="block px-4 py-3 hover:bg-neutral-50 text-secondary">Preferences</a>
					<a href="#account" class="block px-4 py-3 hover:bg-neutral-50 text-neutral-800">Account</a>
					<a href="#notifications" class="block px-4 py-3 hover:bg-neutral-50 text-neutral-800">Notifications</a>
					<a href="#api" class="block px-4 py-3 hover:bg-neutral-50 text-neutral-800">API Keys</a>
				</div>
			</div>
		</div>
		
		<!-- Main Content -->
		<div class="col-span-1 md:col-span-2 space-y-6">
			<!-- Preferences Section -->
			<section id="preferences" class="card">
				<div class="bg-neutral-100 px-6 py-4 border-b border-neutral-300">
					<h2 class="font-display font-medium text-xl">User Preferences</h2>
				</div>
				
				<div class="p-6">
					<form on:submit|preventDefault={savePreferences} class="space-y-6">
						<div>
							<label for="theme" class="block text-sm font-medium text-neutral-700 mb-1">Theme</label>
							<select id="theme" class="retro-input" bind:value={preferences.theme}>
								<option value="light">Light</option>
								<option value="dark">Dark</option>
								<option value="system">System</option>
							</select>
						</div>
						
						<div>
							<label for="language" class="block text-sm font-medium text-neutral-700 mb-1">Language</label>
							<select id="language" class="retro-input" bind:value={preferences.language}>
								<option value="en">English</option>
								<option value="es">Spanish</option>
								<option value="fr">French</option>
								<option value="de">German</option>
							</select>
						</div>
						
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label for="timeFormat" class="block text-sm font-medium text-neutral-700 mb-1">Time Format</label>
								<select id="timeFormat" class="retro-input" bind:value={preferences.timeFormat}>
									<option value="12h">12-hour (AM/PM)</option>
									<option value="24h">24-hour</option>
								</select>
							</div>
							
							<div>
								<label for="dateFormat" class="block text-sm font-medium text-neutral-700 mb-1">Date Format</label>
								<select id="dateFormat" class="retro-input" bind:value={preferences.dateFormat}>
									<option value="MM/DD/YYYY">MM/DD/YYYY</option>
									<option value="DD/MM/YYYY">DD/MM/YYYY</option>
									<option value="YYYY-MM-DD">YYYY-MM-DD</option>
								</select>
							</div>
						</div>
						
						<div class="flex items-center">
							<input 
								id="notifications"
								type="checkbox"
								bind:checked={preferences.notifications}
								class="retro-checkbox"
							/>
							<label for="notifications" class="ml-2 block text-sm text-neutral-700">
								Enable notifications
							</label>
						</div>
						
						<div class="flex items-center">
							<input 
								id="emailNotifications"
								type="checkbox"
								bind:checked={preferences.emailNotifications}
								class="retro-checkbox"
							/>
							<label for="emailNotifications" class="ml-2 block text-sm text-neutral-700">
								Send email notifications
							</label>
						</div>
						
						<div class="pt-4 border-t border-neutral-200 flex justify-end">
							<button type="submit" class="btn-primary">Save Preferences</button>
						</div>
					</form>
				</div>
			</section>
			
			<!-- Account Section -->
			<section id="account" class="card">
				<div class="bg-neutral-100 px-6 py-4 border-b border-neutral-300">
					<h2 class="font-display font-medium text-xl">Account Settings</h2>
				</div>
				
				<div class="p-6">
					<form on:submit|preventDefault={saveAccount} class="space-y-6">
						<div class="flex items-center space-x-4 mb-6">
							<div class="w-16 h-16 rounded-full bg-neutral-300 flex items-center justify-center text-neutral-600 font-medium text-xl">
								{account.name.split(' ').map(n => n[0]).join('')}
							</div>
							<div>
								<h3 class="font-medium">{account.name}</h3>
								<p class="text-sm text-neutral-500">{account.email}</p>
							</div>
						</div>
					
						<div>
							<label for="name" class="block text-sm font-medium text-neutral-700 mb-1">Full Name</label>
							<input 
								type="text"
								id="name"
								bind:value={account.name}
								class="retro-input"
							/>
						</div>
						
						<div>
							<label for="email" class="block text-sm font-medium text-neutral-700 mb-1">Email Address</label>
							<input 
								type="email"
								id="email"
								bind:value={account.email}
								class="retro-input"
							/>
						</div>
						
						<div>
							<label for="password" class="block text-sm font-medium text-neutral-700 mb-1">Change Password</label>
							<input 
								type="password"
								id="password"
								placeholder="New password"
								class="retro-input mb-2"
							/>
							<input 
								type="password"
								id="confirmPassword"
								placeholder="Confirm new password"
								class="retro-input"
							/>
						</div>
						
						<div class="pt-4 border-t border-neutral-200 flex justify-end space-x-3">
							<button type="button" class="btn-outline text-primary border-primary">Delete Account</button>
							<button type="submit" class="btn-primary">Save Changes</button>
						</div>
					</form>
				</div>
			</section>
		</div>
	</div>
</div> 