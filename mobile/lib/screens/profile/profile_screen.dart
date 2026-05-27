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
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(4)),
      ),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom, left: 24, right: 24, top: 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Alterar Senha', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1A1A1A))),
            const SizedBox(height: 20),
            const TextField(decoration: InputDecoration(labelText: 'Senha Atual'), obscureText: true),
            const SizedBox(height: 12),
            const TextField(decoration: InputDecoration(labelText: 'Nova Senha'), obscureText: true),
            const SizedBox(height: 12),
            const TextField(decoration: InputDecoration(labelText: 'Confirmar Nova Senha'), obscureText: true),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () => Navigator.pop(ctx),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF1E3A8A),
                foregroundColor: Colors.white,
              ),
              child: const Text('CONFIRMAR ALTERAÇÃO'),
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
      backgroundColor: const Color(0xFFF5F5F5),
      appBar: AppBar(
        title: const Text('Meu Perfil'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 20.0),
        child: Column(
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border.all(color: const Color(0xFFE0E0E0)),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Column(
                children: [
                  Stack(
                    children: [
                      CircleAvatar(
                        radius: 50,
                        backgroundColor: const Color(0xFFE0E0E0),
                        backgroundImage: user.photoUrl != null 
                            ? NetworkImage(_apiService.getFullUrl(user.photoUrl!)) 
                            : null,
                        child: user.photoUrl == null ? const Icon(Icons.person_outline, size: 50, color: Color(0xFF666666)) : null,
                      ),
                      Positioned(
                        bottom: 0,
                        right: 0,
                        child: CircleAvatar(
                          radius: 16,
                          backgroundColor: const Color(0xFF1E3A8A),
                          child: IconButton(
                            icon: const Icon(Icons.camera_alt_outlined, color: Colors.white, size: 14), 
                            onPressed: _pickImage,
                            padding: EdgeInsets.zero,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text(user.name, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: Color(0xFF1A1A1A))),
                  const SizedBox(height: 4),
                  Text(user.role.toUpperCase(), style: const TextStyle(color: Color(0xFF666666), letterSpacing: 1.0, fontSize: 11, fontWeight: FontWeight.w700)),
                ],
              ),
            ),
            const SizedBox(height: 20),
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border.all(color: const Color(0xFFE0E0E0)),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Column(
                children: [
                  _buildInfoTile('E-mail', user.email, Icons.email_outlined, isLast: false),
                  _buildInfoTile('Matrícula', user.registrationNumber, Icons.badge_outlined, isLast: false),
                  _buildInfoTile('CNH', '${user.cnh?.number ?? "N/A"} (${user.cnh?.category ?? ""})', Icons.drive_eta_outlined, isLast: false),
                  _buildInfoTile('Admissão', user.createdAt != null ? DateFormat('dd/MM/yyyy').format(user.createdAt!) : 'N/A', Icons.calendar_today_outlined, isLast: true),
                ],
              ),
            ),
            const SizedBox(height: 32),
            OutlinedButton.icon(
              onPressed: _changePassword,
              icon: const Icon(Icons.lock_outline, size: 18),
              label: const Text('ALTERAR MINHA SENHA'),
              style: OutlinedButton.styleFrom(
                minimumSize: const Size.fromHeight(50),
                foregroundColor: const Color(0xFF333333),
              ),
            ),
            const SizedBox(height: 10),
            TextButton.icon(
              onPressed: () => authProvider.logout(),
              icon: const Icon(Icons.logout, size: 18),
              label: const Text('SAIR DA CONTA'),
              style: TextButton.styleFrom(
                foregroundColor: Colors.red,
                minimumSize: const Size.fromHeight(50),
              ),
            ),
            const SizedBox(height: 32),
            const Text('VERSÃO 1.0.0', style: TextStyle(color: Color(0xFFBDBDBD), fontSize: 10, letterSpacing: 1)),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoTile(String label, String value, IconData icon, {bool isLast = false}) {
    return Container(
      decoration: BoxDecoration(
        border: isLast ? null : const Border(bottom: BorderSide(color: Color(0xFFE0E0E0), width: 1)),
      ),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: const Color(0xFFEFF6FF),
            borderRadius: BorderRadius.circular(4),
          ),
          child: Icon(icon, color: const Color(0xFF1E3A8A), size: 20),
        ),
        title: Text(label, style: const TextStyle(fontSize: 11, color: Color(0xFF666666), fontWeight: FontWeight.w500)),
        subtitle: Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF1A1A1A))),
        contentPadding: const EdgeInsets.symmetric(vertical: 4, horizontal: 16),
      ),
    );
  }
}
