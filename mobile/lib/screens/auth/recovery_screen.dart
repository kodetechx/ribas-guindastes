import 'package:flutter/material.dart';

class RecoveryScreen extends StatefulWidget {
  const RecoveryScreen({super.key});

  @override
  State<RecoveryScreen> createState() => _RecoveryScreenState();
}

class _RecoveryScreenState extends State<RecoveryScreen> {
  final _emailController = TextEditingController();
  bool _isSent = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Recuperar Senha'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 18),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      backgroundColor: Colors.white,
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 32.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 20),
            Text(
              'Recuperar Acesso',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w700,
                color: Theme.of(context).colorScheme.primary,
                letterSpacing: -0.5,
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              'Digite seu e-mail cadastrado para receber o link de redefinição.',
              style: TextStyle(color: Color(0xFF666666), fontSize: 15),
            ),
            const SizedBox(height: 32),
            
            // Email Field
            TextField(
              controller: _emailController,
              style: const TextStyle(fontSize: 16, color: Color(0xFF1A1A1A)),
              decoration: const InputDecoration(
                labelText: 'E-mail cadastrado',
                suffixIcon: Padding(
                  padding: EdgeInsets.only(right: 12.0),
                  child: Icon(Icons.mail_outline, color: Color(0xFF666666), size: 22),
                ),
              ),
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: 32),
            
            // Send Button
            ElevatedButton(
              onPressed: () {
                setState(() => _isSent = true);
              },
              child: const Text('ENVIAR LINK'),
            ),
            
            if (_isSent) ...[
              const SizedBox(height: 24),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.green.shade50,
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: Colors.green.shade300, width: 1),
                ),
                child: Row(
                  children: [
                    Icon(Icons.check_circle_outline, color: Colors.green.shade700, size: 20),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Se o e-mail estiver cadastrado, você receberá o link em breve.',
                        style: TextStyle(color: Colors.green.shade800, fontSize: 14),
                      ),
                    ),
                  ],
                ),
              ),
            ],
            
            const SizedBox(height: 32),
            
            // Back to Login Button
            TextButton(
              onPressed: () => Navigator.pop(context),
              style: TextButton.styleFrom(
                foregroundColor: const Color(0xFF666666),
              ),
              child: const Text(
                'Voltar para o Login',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
