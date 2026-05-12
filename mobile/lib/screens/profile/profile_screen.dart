import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:image_picker/image_picker.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_service.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final ApiService _apiService = ApiService();

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
                    backgroundColor: Colors.grey.shade100,
                    backgroundImage: user.photoUrl != null 
                        ? NetworkImage(_apiService.getFullUrl(user.photoUrl!)) 
                        : null,
                    child: user.photoUrl == null ? const Icon(Icons.person, size: 60, color: Color(0xFFBDBDBD)) : null,
                  ),
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: CircleAvatar(
                      radius: 20,
                      backgroundColor: const Color(0xFF1E3A8A),
                      child: IconButton(
                        icon: const Icon(Icons.camera_alt_outlined, color: Colors.white, size: 18), 
                        onPressed: _pickImage
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Text(user.name, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF1A1A1A))),
            Text(user.role.toUpperCase(), style: const TextStyle(color: Colors.grey, letterSpacing: 1.2, fontSize: 12, fontWeight: FontWeight.w500)),
            const SizedBox(height: 32),
            _buildInfoTile('E-mail', user.email, Icons.email_outlined),
            _buildInfoTile('Matrícula', user.registrationNumber, Icons.badge_outlined),
            _buildInfoTile('CNH', '${user.cnh?.number ?? "N/A"} (${user.cnh?.category ?? ""})', Icons.drive_eta_outlined),
            _buildInfoTile('Admissão', user.createdAt != null ? DateFormat('dd/MM/yyyy').format(user.createdAt!) : 'N/A', Icons.calendar_today_outlined),
            const SizedBox(height: 40),
            OutlinedButton.icon(
              onPressed: _changePassword,
              icon: const Icon(Icons.lock_outline, size: 18),
              label: const Text('ALTERAR MINHA SENHA', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
              style: OutlinedButton.styleFrom(
                minimumSize: const Size(double.infinity, 50),
                side: BorderSide(color: Colors.grey.shade300),
                foregroundColor: const Color(0xFF333333),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
              ),
            ),
            const SizedBox(height: 12),
            TextButton.icon(
              onPressed: () => authProvider.logout(),
              icon: const Icon(Icons.logout, size: 18),
              label: const Text('SAIR DA CONTA', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
              style: TextButton.styleFrom(
                foregroundColor: Colors.red.shade700,
                minimumSize: const Size(double.infinity, 50),
              ),
            ),
            const SizedBox(height: 48),
            const Text('VERSÃO 1.0.0', style: TextStyle(color: Color(0xFFBDBDBD), fontSize: 10, letterSpacing: 1)),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoTile(String label, String value, IconData icon) {
    return Container(
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Color(0xFFF5F5F5), width: 1)),
      ),
      child: ListTile(
        leading: Icon(icon, color: const Color(0xFF1E3A8A), size: 20),
        title: Text(label, style: const TextStyle(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.w500)),
        subtitle: Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: Color(0xFF1A1A1A))),
        contentPadding: const EdgeInsets.symmetric(vertical: 4),
      ),
    );
  }
}
