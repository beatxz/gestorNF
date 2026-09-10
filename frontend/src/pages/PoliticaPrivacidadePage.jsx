import LegalLayout, { SecaoLegal } from "../components/LegalLayout.jsx"

export default function PoliticaPrivacidadePage() {
    return (
        <LegalLayout
            titulo="Política de Privacidade"
            atualizadoEm="10 de setembro de 2026"
        >
            <SecaoLegal titulo="1. Sobre o GestorNF">
                <p>
                    O GestorNF é uma plataforma destinada à organização e gestão de
                    notas fiscais, clientes, vendedores, vendas e comissões.
                </p>

                <p>
                    Para assuntos relacionados à privacidade e à proteção de dados
                    pessoais, entre em contato pelo e-mail{" "}
                    <strong className="text-foreground">
                        gestordenotasfiscais@gmail.com
                    </strong>.
                </p>
            </SecaoLegal>

            <SecaoLegal titulo="2. Dados tratados">
                <p>
                    Dependendo da utilização da plataforma, poderão ser tratados dados
                    relacionados à conta do usuário, vendedores, clientes, notas fiscais
                    e operações comerciais.
                </p>

                <ul className="list-disc space-y-1 pl-5">
                    <li>nome e endereço de e-mail;</li>
                    <li>senha armazenada de forma protegida por hash;</li>
                    <li>dados necessários para autenticação e recuperação de acesso;</li>
                    <li>nomes e comissões de vendedores;</li>
                    <li>código do cliente, nome ou razão social e CNPJ;</li>
                    <li>telefone, município e transportadora;</li>
                    <li>número, valor e data de notas fiscais;</li>
                    <li>informações utilizadas para cálculo de vendas e comissões.</li>
                </ul>
            </SecaoLegal>

            <SecaoLegal titulo="3. Documentos importados">
                <p>
                    Quando o recurso de importação de notas fiscais for utilizado,
                    arquivos PDF poderão ser enviados para processamento com a finalidade
                    de extrair informações necessárias às funcionalidades do GestorNF.
                </p>

                <p>
                    O usuário é responsável por possuir fundamento legítimo para inserir
                    e tratar dados pessoais de terceiros por meio da plataforma.
                </p>
            </SecaoLegal>

            <SecaoLegal titulo="4. Finalidades do tratamento">
                <p>Os dados poderão ser utilizados para:</p>

                <ul className="list-disc space-y-1 pl-5">
                    <li>criar e administrar contas;</li>
                    <li>autenticar usuários e proteger acessos;</li>
                    <li>verificar e-mails e permitir recuperação de senha;</li>
                    <li>organizar clientes, vendedores e notas fiscais;</li>
                    <li>calcular vendas e comissões;</li>
                    <li>processar documentos enviados pelo usuário;</li>
                    <li>gerar relatórios;</li>
                    <li>prevenir abusos e tentativas indevidas de acesso;</li>
                    <li>atender solicitações relacionadas à privacidade;</li>
                    <li>cumprir obrigações legais ou regulatórias aplicáveis.</li>
                </ul>
            </SecaoLegal>

            <SecaoLegal titulo="5. Dados de terceiros">
                <p>
                    O GestorNF permite que usuários cadastrem informações relacionadas
                    aos seus clientes, vendedores e operações.
                </p>

                <p>
                    O usuário que determina quais informações serão cadastradas e para
                    quais finalidades serão utilizadas é responsável por observar as
                    obrigações aplicáveis ao tratamento desses dados.
                </p>
            </SecaoLegal>

            <SecaoLegal titulo="6. Fornecedores de tecnologia">
                <p>
                    Para disponibilizar o serviço, o GestorNF utiliza fornecedores de
                    infraestrutura para funções como hospedagem da aplicação, banco de
                    dados, envio de e-mails e armazenamento de cópias de segurança.
                </p>

                <p>
                    Esses fornecedores poderão processar informações na medida necessária
                    para a prestação de seus respectivos serviços.
                </p>

                <p>
                    O GestorNF não comercializa dados pessoais de seus usuários.
                </p>
            </SecaoLegal>

            <SecaoLegal titulo="7. Segurança">
                <p>
                    São adotadas medidas técnicas e administrativas destinadas a reduzir
                    riscos de acesso não autorizado, perda, alteração ou exposição
                    indevida de informações.
                </p>

                <p>
                    Entre elas estão mecanismos de autenticação, proteção de senhas,
                    controle de acesso, limitação de tentativas, validação de arquivos e
                    cópias de segurança protegidas.
                </p>

                <p>
                    Nenhum sistema conectado à internet pode garantir risco zero.
                </p>
            </SecaoLegal>

            <SecaoLegal titulo="8. Retenção e exclusão">
                <p>
                    Os dados permanecem armazenados enquanto forem necessários para a
                    prestação do serviço e demais finalidades legítimas aplicáveis.
                </p>

                <p>
                    O usuário pode excluir sua conta por meio da funcionalidade disponível
                    no GestorNF. Após a confirmação, os dados vinculados à conta são
                    removidos dos sistemas ativos.
                </p>

                <p>
                    Cópias residuais poderão permanecer em backups protegidos por até{" "}
                    <strong className="text-foreground">60 dias</strong>, sendo
                    posteriormente removidas conforme o ciclo de retenção.
                </p>

                <p>
                    Informações poderão ser conservadas por período adicional quando isso
                    for necessário para cumprimento de obrigação legal, exercício regular
                    de direitos ou outra hipótese permitida pela legislação.
                </p>

                <p>
                    O GestorNF não mantém o endereço de e-mail exclusivamente para
                    registrar que determinada pessoa já utilizou o serviço após a
                    exclusão definitiva da conta.
                </p>
            </SecaoLegal>

            <SecaoLegal titulo="9. Direitos dos titulares">
                <p>
                    Conforme aplicável, titulares de dados pessoais poderão solicitar:
                </p>

                <ul className="list-disc space-y-1 pl-5">
                    <li>confirmação da existência de tratamento;</li>
                    <li>acesso aos dados;</li>
                    <li>correção de informações incorretas ou desatualizadas;</li>
                    <li>informações sobre o tratamento realizado;</li>
                    <li>anonimização, bloqueio ou eliminação quando cabível;</li>
                    <li>
                        eliminação de dados tratados com consentimento, quando aplicável;
                    </li>
                    <li>informações sobre compartilhamento de dados;</li>
                    <li>outros direitos previstos pela legislação aplicável.</li>
                </ul>
            </SecaoLegal>

            <SecaoLegal titulo="10. Como exercer seus direitos">
                <p>
                    Solicitações relacionadas à privacidade e proteção de dados podem ser
                    encaminhadas para:
                </p>

                <p>
                    <strong className="text-foreground">
                        gestordenotasfiscais@gmail.com
                    </strong>
                </p>

                <p>
                    Poderá ser solicitada confirmação da identidade antes do atendimento
                    de determinados pedidos, como medida de segurança.
                </p>
            </SecaoLegal>

            <SecaoLegal titulo="11. Responsabilidades do usuário">
                <p>O usuário deve:</p>

                <ul className="list-disc space-y-1 pl-5">
                    <li>fornecer informações verdadeiras;</li>
                    <li>proteger suas credenciais de acesso;</li>
                    <li>não compartilhar sua senha;</li>
                    <li>
                        inserir dados de terceiros somente quando possuir fundamento
                        legítimo para isso;
                    </li>
                    <li>utilizar a plataforma de acordo com a legislação aplicável.</li>
                </ul>
            </SecaoLegal>

            <SecaoLegal titulo="12. Alterações desta Política">
                <p>
                    Esta Política poderá ser atualizada para refletir alterações no
                    GestorNF, nas práticas relacionadas ao tratamento de dados ou na
                    legislação aplicável.
                </p>

                <p>
                    A versão vigente permanecerá disponível nesta página com sua
                    respectiva data de atualização.
                </p>
            </SecaoLegal>

            <SecaoLegal titulo="13. Contato">
                <p>
                    Dúvidas ou solicitações podem ser enviadas para{" "}
                    <strong className="text-foreground">
                        gestordenotasfiscais@gmail.com
                    </strong>.
                </p>
            </SecaoLegal>
        </LegalLayout>
    )
}