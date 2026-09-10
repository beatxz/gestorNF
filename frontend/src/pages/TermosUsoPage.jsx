import LegalLayout, { SecaoLegal } from "../components/LegalLayout.jsx"

export default function TermosUsoPage() {
    return (
        <LegalLayout
            titulo="Termos de Uso"
            atualizadoEm="10 de setembro de 2026"
        >
            <SecaoLegal titulo="1. Sobre o GestorNF">
                <p>
                    O GestorNF é uma plataforma destinada a auxiliar na organização de
                    notas fiscais, clientes, vendedores, vendas, comissões e informações
                    relacionadas às atividades do usuário.
                </p>

                <p>
                    Contato:{" "}
                    <strong className="text-foreground">
                        gestordenotasfiscais@gmail.com
                    </strong>
                </p>
            </SecaoLegal>

            <SecaoLegal titulo="2. Cadastro e conta">
                <p>
                    Para utilizar funcionalidades protegidas do GestorNF, poderá ser
                    necessário criar uma conta.
                </p>

                <p>
                    O usuário deve fornecer informações corretas e é responsável pela
                    proteção de suas credenciais de acesso.
                </p>

                <p>A senha é pessoal e não deve ser compartilhada.</p>
            </SecaoLegal>

            <SecaoLegal titulo="3. Uso permitido">
                <p>O GestorNF deve ser utilizado para finalidades lícitas.</p>

                <p>Não é permitido:</p>

                <ul className="list-disc space-y-1 pl-5">
                    <li>utilizar a plataforma para atividades ilícitas;</li>
                    <li>tentar acessar contas ou dados de terceiros;</li>
                    <li>contornar mecanismos de autenticação ou segurança;</li>
                    <li>explorar deliberadamente vulnerabilidades;</li>
                    <li>enviar arquivos maliciosos;</li>
                    <li>prejudicar a disponibilidade ou funcionamento do sistema;</li>
                    <li>
                        tratar dados pessoais de terceiros de forma contrária à legislação
                        aplicável.
                    </li>
                </ul>
            </SecaoLegal>

            <SecaoLegal titulo="4. Informações inseridas pelo usuário">
                <p>
                    O usuário é responsável pelas informações e documentos cadastrados
                    ou importados no GestorNF.
                </p>

                <p>
                    Isso inclui verificar se possui fundamento legítimo para tratar dados
                    pessoais de clientes, vendedores ou terceiros.
                </p>
            </SecaoLegal>

            <SecaoLegal titulo="5. Importação de notas fiscais">
                <p>
                    O GestorNF poderá realizar leitura e extração automatizada de
                    informações presentes em notas fiscais e documentos compatíveis com
                    suas funcionalidades.
                </p>

                <p>
                    O usuário deve conferir as informações extraídas antes de utilizá-las.
                    Processamentos automatizados podem apresentar falhas de leitura,
                    formatos incompatíveis ou informações incompletas.
                </p>

                <p>
                    O GestorNF é uma ferramenta de organização e apoio e não substitui
                    serviços profissionais de contabilidade, consultoria fiscal, jurídica
                    ou financeira.
                </p>
            </SecaoLegal>

            <SecaoLegal titulo="6. Cálculos e relatórios">
                <p>
                    Valores, comissões, totais e relatórios são calculados com base nas
                    informações cadastradas ou importadas e nas configurações existentes
                    na conta.
                </p>

                <p>
                    O usuário deve conferir essas informações antes de utilizá-las para
                    pagamentos, obrigações fiscais, contabilidade ou outras decisões
                    relevantes.
                </p>
            </SecaoLegal>

            <SecaoLegal titulo="7. Disponibilidade">
                <p>
                    O GestorNF busca manter o serviço disponível e funcional, mas não
                    garante funcionamento ininterrupto ou totalmente livre de falhas.
                </p>

                <p>
                    Poderão ocorrer indisponibilidades relacionadas a manutenção,
                    atualização, infraestrutura, serviços de terceiros, problemas de
                    conexão ou incidentes de segurança.
                </p>
            </SecaoLegal>

            <SecaoLegal titulo="8. Segurança">
                <p>
                    O GestorNF adota medidas destinadas a reduzir riscos relacionados ao
                    acesso não autorizado e à perda ou exposição indevida de informações.
                </p>

                <p>
                    O usuário também é responsável por proteger suas credenciais,
                    dispositivos e meios de acesso.
                </p>
            </SecaoLegal>

            <SecaoLegal titulo="9. Exclusão da conta">
                <p>
                    O usuário poderá excluir sua conta utilizando a funcionalidade
                    disponibilizada pela plataforma.
                </p>

                <p>
                    Por segurança, será solicitada confirmação da senha atual.
                </p>

                <p>
                    Após a exclusão, os dados vinculados à conta serão removidos dos
                    sistemas ativos, observadas as hipóteses legais de conservação e o
                    ciclo de retenção dos backups.
                </p>

                <p>
                    A exclusão da conta é definitiva e não poderá ser desfeita.
                </p>
            </SecaoLegal>

            <SecaoLegal titulo="10. Backups">
                <p>
                    O GestorNF mantém cópias de segurança destinadas à recuperação de
                    dados em situações de falha ou incidente.
                </p>

                <p>
                    Dados removidos dos sistemas ativos poderão permanecer em backups por
                    até <strong className="text-foreground">60 dias</strong>, sendo
                    posteriormente removidos conforme o ciclo de retenção.
                </p>
            </SecaoLegal>

            <SecaoLegal titulo="11. Privacidade">
                <p>
                    O tratamento de dados pessoais relacionado à utilização do GestorNF
                    está descrito na Política de Privacidade da plataforma.
                </p>
            </SecaoLegal>

            <SecaoLegal titulo="12. Alterações no serviço">
                <p>
                    Funcionalidades poderão ser adicionadas, modificadas ou removidas
                    conforme a evolução do GestorNF.
                </p>
            </SecaoLegal>

            <SecaoLegal titulo="13. Suspensão de acesso">
                <p>
                    O acesso poderá ser restringido quando houver indícios razoáveis de
                    uso ilícito, abuso dos recursos, tentativa de acesso não autorizado,
                    comprometimento da segurança ou violação relevante destes Termos.
                </p>
            </SecaoLegal>

            <SecaoLegal titulo="14. Propriedade do serviço">
                <p>
                    O uso da plataforma não transfere ao usuário direitos sobre o
                    código-fonte, identidade visual, design ou demais elementos próprios
                    do GestorNF.
                </p>

                <p>
                    Os dados e documentos inseridos pelo usuário não passam a pertencer
                    ao GestorNF em razão do uso da plataforma.
                </p>
            </SecaoLegal>

            <SecaoLegal titulo="15. Responsabilidades">
                <p>
                    O GestorNF não se responsabiliza por informações incorretas inseridas
                    pelo usuário ou por decisões tomadas exclusivamente com base em
                    informações que não tenham sido conferidas.
                </p>

                <p>
                    Estes Termos não têm a finalidade de afastar responsabilidades que
                    não possam ser legalmente excluídas.
                </p>
            </SecaoLegal>

            <SecaoLegal titulo="16. Alterações dos Termos">
                <p>
                    Estes Termos poderão ser atualizados em razão de alterações no
                    serviço, nas práticas do GestorNF ou na legislação aplicável.
                </p>
            </SecaoLegal>

            <SecaoLegal titulo="17. Contato">
                <p>
                    Dúvidas sobre estes Termos podem ser enviadas para{" "}
                    <strong className="text-foreground">
                        gestordenotasfiscais@gmail.com
                    </strong>.
                </p>
            </SecaoLegal>
        </LegalLayout>
    )
}