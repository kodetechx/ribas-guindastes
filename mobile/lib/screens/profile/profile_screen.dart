import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:image_picker/image_picker.dart';
import '../../providers/auth_provider.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  void _pickImage() async {
    final ImagePicker picker = ImagePicker();
    await picker.pickImage(source: ImageSource.gallery);
    // In real app, upload image to API
  }

  void _changePassword() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom, left: 24, right: 24, top: 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Alterar Senha', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 24),
            const TextField(decoration: InputDecoration(labelText: 'Senha Atual', border: OutlineInputBorder()), obscureText: true),
            const SizedBox(height: 12),
            const TextField(decoration: InputDecoration(labelText: 'Nova Senha', border: OutlineInputBorder()), obscureText: true),
            const SizedBox(height: 12),
            const TextField(decoration: InputDecoration(labelText: 'Confirmar Nova Senha', border: OutlineInputBorder()), obscureText: true),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => Navigator.pop(ctx),
              style: ElevatedButton.styleFrom(backgroundColor: Colors.black, foregroundColor: const Color(0xFFFFD700), padding: const EdgeInsets.symmetric(vertical: 16)),
              child: const Text('ALTERAR SENHA'),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.user;

    if (user == null) return const Center(child: CircularProgressIndicator());

    return Scaffold(
      appBar: AppBar(
        title: const Text('Meu Perfil'),
        backgroundColor: const Color(0xFFFFD700),
        foregroundColor: Colors.black,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Center(
              child: Stack(
                children: [
                  CircleAvatar(
                    radius: 60,
                    backgroundColor: Colors.grey.shade200,
                    backgroundImage: user.photoUrl != null ? NetworkImage(user.photoUrl!) : null,
                    child: user.photoUrl == null ? const Icon(Icons.person, size: 60, color: Colors.grey) : null,
                  ),
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: CircleAvatar(
                      backgroundColor: const Color(0xFFFFD700),
                      child: IconButton(icon: const Icon(Icons.camera_alt, color: Colors.black), onPressed: _pickImage),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Text(user.name, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            Text(user.role.toUpperCase(), style: const TextStyle(color: Colors.grey, letterSpacing: 1.2)),
            const SizedBox(height: 32),
            _buildInfoTile('E-mail', user.email, Icons.email_outlined),
            _buildInfoTile('Matrícula', user.registrationNumber, Icons.badge_outlined),
            _buildInfoTile('CNH', '${user.cnh?.number ?? "N/A"} (${user.cnh?.category ?? ""})', Icons.drive_eta_outlined),
            _buildInfoTile('Admissão', user.createdAt != null ? DateFormat('dd/MM/yyyy').format(user.createdAt!) : 'N/A', Icons.calendar_today_outlined),
            const SizedBox(height: 32),
            OutlinedButton.icon(
              onPressed: _changePassword,
              icon: const Icon(Icons.lock_outline),
              label: const Text('ALTERAR SENHA'),
              style: OutlinedButton.styleFrom(minimumSize: const Size(double.infinity, 50)),
            ),
            const SizedBox(height: 12),
            ElevatedButton.icon(
              onPressed: () => authProvider.logout(),
              icon: const Icon(Icons.logout),
              label: const Text('SAIR DA CONTA'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red.shade50,
                foregroundColor: Colors.red,
                minimumSize: const Size(double.infinity, 50),
                elevation: 0,
              ),
            ),
            const SizedBox(height: 48),
            const Text('Versão 1.0.0', style: TextStyle(color: Colors.grey, fontSize: 12)),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoTile(String label, String value, IconData icon) {
    return ListTile(
      leading: Icon(icon, color: Colors.black54),
      title: Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
      subtitle: Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500, color: Colors.black)),
      contentPadding: EdgeInsets.zero,
    );
  }
}
